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
        console.error('Monday GraphQL errors:', JSON.stringify(result.errors, null, 2));
        const errorMsg = result.errors[0].message || 'Unknown error';
        const errorPath = result.errors[0].path ? ` (${result.errors[0].path.join('.')})` : '';
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

    // Create a simple update to attach files to
    console.log(`Creating update for ${files.length} file(s) on item ${itemId}...`);
    
    const createUpdateMutation = `
      mutation ($itemId: ID!) {
        create_update(
          item_id: $itemId,
          body: "📎 Attachments"
        ) {
          id
        }
      }
    `;

    const updateResult = await this.query(createUpdateMutation, {
      itemId: itemId
    });

    if (!updateResult.create_update || !updateResult.create_update.id) {
      console.error('Failed to create update:', updateResult);
      throw new Error('Could not create update for file attachments');
    }

    const updateId = updateResult.create_update.id;
    console.log(`✓ Update created with ID: ${updateId}`);

    // Upload files with progress tracking
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

        await this.uploadFileToUpdate(updateId, file);
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

      // Monday.com multipart upload format (GraphQL multipart request spec)
      // Reference: https://github.com/jaydenseric/graphql-multipart-request-spec
      
      console.log('Uploading file using Monday.com multipart format...');
      
      const formData = new FormData();
      
      // 1. Operations: The GraphQL mutation with variable placeholder
      const operations = {
        query: `
          mutation ($file: File!) {
            add_file_to_update(update_id: ${updateId}, file: $file) {
              id
              name
              url
              file_extension
              file_size
            }
          }
        `,
        variables: {
          file: null  // Will be replaced by the actual file
        }
      };
      
      formData.append('operations', JSON.stringify(operations));
      
      // 2. Map: Links the file to the variable path
      const map = {
        "0": ["variables.file"]  // File at position "0" maps to "variables.file"
      };
      
      formData.append('map', JSON.stringify(map));
      
      // 3. File: The actual file with key "0" (matching the map)
      formData.append('0', blob, file.name);
      
      console.log('Multipart request prepared:');
      console.log('- Operations:', JSON.stringify(operations, null, 2));
      console.log('- Map:', JSON.stringify(map));
      console.log('- File key: "0", name:', file.name, 'size:', blob.size);
      
      const response = await fetch(this.apiUrl, {
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
        console.error('File upload GraphQL errors:', JSON.stringify(result.errors, null, 2));
        throw new Error(result.errors[0].message);
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
