// Monday.com API Integration Module
// Handles authentication, GraphQL queries, and file uploads

export class MondayAPI {
  constructor() {
    this.token = null;
    this.apiUrl = 'https://api.monday.com/v2';
  }

  setToken(token) {
    this.token = token;
  }

  async query(query, variables = {}) {
    if (!this.token) {
      console.error('Monday.com token not set');
      throw new Error('Monday.com token not set');
    }

    console.log('Monday API query:', { 
      query: query.substring(0, 100) + '...', 
      variables 
    });

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.token,
          'API-Version': '2024-01'
        },
        body: JSON.stringify({ query, variables })
      });

      console.log('Monday API response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Monday API HTTP error:', response.status, errorText);
        throw new Error(`Monday API error (${response.status}): ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Monday API result:', result);
      
      if (result.errors && result.errors.length > 0) {
        const errorMsg = result.errors[0].message || 'Unknown error';
        const errorCode = result.errors[0].extensions?.code;
        const errorPath = result.errors[0].path ? ` (${result.errors[0].path.join('.')})` : '';
        
        // Only log full error details for non-authorization errors to reduce noise
        if (errorCode === 'UserUnauthorizedException') {
          console.warn(`Monday API: ${errorMsg}${errorPath} - This is normal if your token has limited board access`);
        } else {
          console.error('Monday GraphQL errors:', JSON.stringify(result.errors, null, 2));
        }
        
        throw new Error(`Monday GraphQL error: ${errorMsg}${errorPath}`);
      }

      if (!result.data) {
        console.error('No data in Monday response:', result);
        throw new Error('No data returned from Monday API');
      }

      return result.data;
    } catch (error) {
      console.error('Monday API query failed:', error);
      throw error;
    }
  }

  async fetchWorkspaces() {
    console.log('Fetching all boards with pagination...');
    const allBoards = [];
    let page = 1;
    const limit = 50; // Monday.com typically allows up to 500, but we'll use 50 for safety
    let hasMore = true;

    while (hasMore) {
      console.log(`Fetching boards page ${page}...`);
      
      const query = `
        query ($page: Int!, $limit: Int!) {
          boards(limit: $limit, page: $page) {
            id
            name
            workspace {
              id
              name
            }
            groups {
              id
              title
            }
          }
        }
      `;

      try {
        const data = await this.query(query, { page, limit });
        const boards = data.boards || [];
        
        console.log(`Received ${boards.length} boards on page ${page}`);
        
        if (boards.length > 0) {
          allBoards.push(...boards);
          
          // If we got less than the limit, we've reached the end
          if (boards.length < limit) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error(`Error fetching boards page ${page}:`, error);
        
        // If it's an authorization error, stop pagination gracefully and return what we have
        if (error.message && (error.message.includes('unauthorized') || error.message.includes('UserUnauthorizedException'))) {
          console.warn(`⚠️ Unauthorized access at page ${page} - this is normal if token has limited board access`);
          hasMore = false;
        } else {
          // For other errors, still stop but log differently
          console.warn(`Pagination stopped at page ${page} due to error`);
          hasMore = false;
        }
      }
    }

    console.log(`Total boards fetched: ${allBoards.length}`);
    
    // Sort boards by workspace name, then by board name
    allBoards.sort((a, b) => {
      const workspaceA = a.workspace?.name || 'No Workspace';
      const workspaceB = b.workspace?.name || 'No Workspace';
      
      if (workspaceA !== workspaceB) {
        return workspaceA.localeCompare(workspaceB);
      }
      
      return a.name.localeCompare(b.name);
    });

    return allBoards;
  }

  async fetchRecentItems(boardId, groupId, limit = 10) {
    const query = `
      query ($boardId: [ID!]!, $limit: Int!) {
        boards(ids: $boardId) {
          groups(ids: ["${groupId}"]) {
            items_page(limit: $limit) {
              items {
                id
                name
                created_at
                updated_at
                column_values {
                  id
                  text
                  value
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.query(query, { 
      boardId: [boardId], 
      limit 
    });

    if (data.boards && data.boards[0] && data.boards[0].groups[0]) {
      return data.boards[0].groups[0].items_page.items;
    }

    return [];
  }

  async createBugItem(boardId, groupId, bugData, attachments = []) {
    // Create the item with the Title field as the item name
    const bugTitle = bugData.title || bugData.description || 'New Bug';
    
    const createQuery = `
      mutation ($boardId: ID!, $groupId: String!, $itemName: String!) {
        create_item(
          board_id: $boardId,
          group_id: $groupId,
          item_name: $itemName
        ) {
          id
          name
          url
        }
      }
    `;

    const result = await this.query(createQuery, {
      boardId: boardId,
      groupId: groupId,
      itemName: bugTitle
    });

    const item = result.create_item;

    // Add bug details as an update (post)
    try {
      await this.addBugDetailsUpdate(item.id, bugData);
    } catch (error) {
      console.error('Failed to add bug details:', error);
      // Continue anyway - item was created
    }

    // Attach files to the update (this is more reliable than column attachments)
    if (attachments && attachments.length > 0) {
      console.log(`Attaching ${attachments.length} files to item ${item.id}...`);
      try {
        const uploadResults = await this.addFilesToItem(item.id, attachments);
        console.log('File upload results:', uploadResults);
        
        // Return item with upload results
        return {
          ...item,
          uploadResults: uploadResults
        };
      } catch (error) {
        console.error('Failed to attach files:', error);
        // Return item with error info but don't fail the whole operation
        return {
          ...item,
          uploadResults: {
            uploaded: [],
            failed: attachments.map(f => ({ name: f.name, error: error.message }))
          }
        };
      }
    }

    return item;
  }

  async addBugDetailsUpdate(itemId, bugData) {
    // Format bug details as markdown with bold labels
    // Using **Label:** format for bold in Monday.com
    let updateText = '';
    
    // Add platform info
    if (bugData.platform) {
      updateText += `**Platform:** ${bugData.platform}\n`;
    }
    
    // Add environment
    if (bugData.env) {
      updateText += `**ENV:** ${bugData.env}\n`;
    }
    
    // Add version
    if (bugData.version) {
      updateText += `**Version:** ${bugData.version}\n`;
    }
    
    // Add description
    if (bugData.description) {
      updateText += `\n**Description:**\n${bugData.description}\n`;
    }
    
    // Add steps to reproduce
    if (bugData.stepsToReproduce) {
      updateText += `\n**Steps to reproduce:**\n${bugData.stepsToReproduce}\n`;
    }
    
    // Add actual result
    if (bugData.actualResult) {
      updateText += `\n**Actual result:**\n${bugData.actualResult}\n`;
    }
    
    // Add expected result
    if (bugData.expectedResult) {
      updateText += `\n**Expected result:**\n${bugData.expectedResult}\n`;
    }
    
    // Add logs note
    updateText += `\n**Logs:** (HAR attached if available)\n`;
    
    // Add media note
    updateText += `**Media:** (screenshots attached if available)\n`;

    const mutation = `
      mutation ($itemId: ID!, $body: String!) {
        create_update(
          item_id: $itemId,
          body: $body
        ) {
          id
        }
      }
    `;

    await this.query(mutation, {
      itemId: itemId,
      body: updateText
    });
  }

  escapeMarkdown(text) {
    // Escape markdown special characters to prevent breaking formatting
    // But preserve newlines and basic formatting
    if (!text) return '';
    return text.toString();
  }

  buildColumnValues(bugData) {
    // Map bug data fields to Monday column values
    // This is a simplified version - actual implementation depends on board structure
    const values = {};

    // Example mapping (adjust based on actual Monday board columns)
    if (bugData.platform) {
      values.platform = { text: bugData.platform };
    }
    if (bugData.env) {
      values.environment = { text: bugData.env };
    }
    if (bugData.version) {
      values.version = { text: bugData.version };
    }

    // Long text fields
    if (bugData.description) {
      values.description = { text: bugData.description };
    }
    if (bugData.stepsToReproduce) {
      values.steps = { text: bugData.stepsToReproduce };
    }
    if (bugData.actualResult) {
      values.actual = { text: bugData.actualResult };
    }
    if (bugData.expectedResult) {
      values.expected = { text: bugData.expectedResult };
    }

    return values;
  }

  async addFilesToItem(itemId, files, progressCallback = null) {
    if (!files || files.length === 0) {
      return { success: true, uploaded: [], failed: [] };
    }

    const results = {
      uploaded: [],
      failed: []
    };

    console.log(`Uploading ${files.length} file(s) directly to item ${itemId}...`);

    // Upload files directly to item (no update needed)
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Report progress
      if (progressCallback) {
        progressCallback({
          current: i + 1,
          total: files.length,
          fileName: file.name,
          status: 'uploading'
        });
      }

      try {
        // Check file size (Monday.com typically limits to ~500MB)
        const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
        if (file.size && file.size > MAX_FILE_SIZE) {
          throw new Error(`File too large: ${file.name} exceeds 500MB limit`);
        }

        await this.uploadFileToItem(itemId, file);
        results.uploaded.push(file.name);

        if (progressCallback) {
          progressCallback({
            current: i + 1,
            total: files.length,
            fileName: file.name,
            status: 'completed'
          });
        }
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        results.failed.push({
          name: file.name,
          error: error.message
        });

        if (progressCallback) {
          progressCallback({
            current: i + 1,
            total: files.length,
            fileName: file.name,
            status: 'failed',
            error: error.message
          });
        }
      }
    }

    return results;
  }

  async uploadFileToItem(itemId, file, retryCount = 0) {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;

    try {
      console.log(`📤 Uploading ${file.name} to item ${itemId} (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
      
      // Convert data URL to blob
      let blob;
      let mimeType = file.type || 'application/octet-stream';

      if (file.dataUrl) {
        blob = await this.dataUrlToBlob(file.dataUrl);
        
        if (file.dataUrl.startsWith('data:')) {
          const match = file.dataUrl.match(/^data:([^;]+);/);
          if (match) {
            mimeType = match[1];
          }
        }
      } else if (file.blob) {
        blob = file.blob;
        mimeType = blob.type || mimeType;
      } else {
        throw new Error('File must have dataUrl or blob property');
      }

      if (blob.type !== mimeType) {
        blob = new Blob([blob], { type: mimeType });
      }

      console.log(`  ├─ Size: ${(blob.size / 1024).toFixed(2)} KB`);
      console.log(`  ├─ Type: ${mimeType}`);
      console.log(`  └─ Name: ${file.name}`);

      // First create an update to attach the file to
      console.log('  Creating update for file attachment...');
      const createUpdateMutation = `
        mutation {
          create_update(
            item_id: ${parseInt(itemId)},
            body: "📎 ${file.name}"
          ) {
            id
          }
        }
      `;

      const updateResult = await this.query(createUpdateMutation);
      
      if (!updateResult.create_update || !updateResult.create_update.id) {
        throw new Error('Failed to create update for file');
      }

      const updateId = parseInt(updateResult.create_update.id);
      console.log(`  ✓ Update created: ${updateId}`);

      // Now attach file to the update
      const formData = new FormData();
      
      const query = `mutation { 
        add_file_to_update(update_id: ${updateId}) { 
          id 
          name
          url
        } 
      }`;
      
      formData.append('query', query);
      formData.append('file', blob, file.name);
      
      console.log('  Uploading file to Monday.com...');
      
      const response = await fetch('https://api.monday.com/v2/file', {
        method: 'POST',
        headers: {
          'Authorization': this.token
        },
        body: formData
      });

      console.log(`  Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('  ❌ HTTP Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('  Response data:', result);
      
      if (result.errors && result.errors.length > 0) {
        const error = result.errors[0];
        console.error('  ❌ GraphQL Error:', error.message);
        throw new Error(error.message);
      }

      if (!result.data || !result.data.add_file_to_update) {
        console.error('  ❌ No file data returned:', result);
        throw new Error('Upload succeeded but no file data returned');
      }

      console.log(`  ✅ File uploaded successfully!`);
      console.log(`  └─ URL: ${result.data.add_file_to_update.url}`);
      return result;

    } catch (error) {
      console.error(`  ❌ Upload failed: ${error.message}`);
      
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`  ⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.uploadFileToItem(itemId, file, retryCount + 1);
      }
      
      throw new Error(`Upload failed after ${MAX_RETRIES} attempts: ${error.message}`);
    }
  }

  async uploadFileToUpdate(updateId, file, retryCount = 0) {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // Start with 1 second

    try {
      console.log(`Uploading file ${file.name} to update ${updateId} (attempt ${retryCount + 1})...`);
      
      // Convert data URL to blob with MIME type detection
      let blob;
      let mimeType = file.type || 'application/octet-stream';

      if (file.dataUrl) {
        blob = await this.dataUrlToBlob(file.dataUrl);
        
        // Detect MIME type from data URL if not provided
        if (file.dataUrl.startsWith('data:')) {
          const match = file.dataUrl.match(/^data:([^;]+);/);
          if (match) {
            mimeType = match[1];
          }
        }
      } else if (file.blob) {
        blob = file.blob;
        mimeType = blob.type || mimeType;
      } else {
        console.error('File missing dataUrl or blob:', file);
        throw new Error('File must have dataUrl or blob property');
      }

      // Ensure blob has correct type
      if (blob.type !== mimeType) {
        blob = new Blob([blob], { type: mimeType });
      }

      console.log(`File size: ${(blob.size / 1024).toFixed(2)} KB, MIME: ${mimeType}`);

      // Monday.com file upload endpoint
      // For /v2/file, the mutation doesn't use $file variable
      // The file is automatically picked up from the 'file' form field
      
      console.log('Uploading file to Monday.com file upload endpoint...');
      
      const formData = new FormData();
      
      // The mutation for add_file_to_update - file is implicit from form data
      const query = `mutation { 
        add_file_to_update(update_id: ${parseInt(updateId)}) { 
          id 
          name 
          url 
          file_extension 
          file_size 
        } 
      }`;
      
      formData.append('query', query);
      formData.append('file', blob, file.name);
      
      console.log('Upload request:');
      console.log('- Update ID:', updateId);
      console.log('- File name:', file.name);
      console.log('- File size:', blob.size);
      console.log('- MIME type:', mimeType);
      
      // Monday.com's file upload endpoint (different from GraphQL endpoint)
      const fileUploadUrl = 'https://api.monday.com/v2/file';
      
      const response = await fetch(fileUploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': this.token
          // Content-Type is auto-set by browser with multipart boundary
        },
        body: formData
      });

      console.log(`Upload response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('File upload HTTP error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Upload result:', result);
      
      if (result.errors && result.errors.length > 0) {
        const errorMsg = result.errors[0].message || 'Unknown upload error';
        console.error('File upload failed:', errorMsg);
        console.error('Full error details:', JSON.stringify(result.errors, null, 2));
        throw new Error(errorMsg);
      }

      if (!result.data || !result.data.add_file_to_update) {
        console.error('No file upload data in response:', result);
        throw new Error('File upload succeeded but no data returned');
      }

      console.log(`✓ File ${file.name} uploaded successfully`);
      return result;

    } catch (error) {
      // Retry with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`Retrying file upload for ${file.name} in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.uploadFileToUpdate(updateId, file, retryCount + 1);
      }

      throw new Error(`Upload failed after ${MAX_RETRIES} attempts: ${error.message}`);
    }
  }

  async dataUrlToBlob(dataUrl) {
    const response = await fetch(dataUrl);
    return await response.blob();
  }

  // Test connection by fetching user info
  async testConnection() {
    const query = `
      query {
        me {
          id
          name
          email
        }
      }
    `;

    const data = await this.query(query);
    return data.me;
  }
}
