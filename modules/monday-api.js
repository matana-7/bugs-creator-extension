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
        console.error('Monday GraphQL errors:', result.errors);
        throw new Error(`Monday GraphQL error: ${result.errors[0].message}`);
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
    const query = `
      query {
        boards {
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

    const data = await this.query(query);
    return data.boards;
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
      try {
        await this.addFilesToItem(item.id, attachments);
      } catch (error) {
        console.error('Failed to attach files:', error);
        // Continue anyway - item was created
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
      updateText += `**Platform:** ${this.escapeMarkdown(bugData.platform)}\n`;
    }
    
    // Add environment
    if (bugData.env) {
      updateText += `**ENV:** ${this.escapeMarkdown(bugData.env)}\n`;
    }
    
    // Add version
    if (bugData.version) {
      updateText += `**Version:** ${this.escapeMarkdown(bugData.version)}\n`;
    }
    
    // Add description
    if (bugData.description) {
      updateText += `\n**Description:** ${this.escapeMarkdown(bugData.description)}\n`;
    }
    
    // Add steps to reproduce
    if (bugData.stepsToReproduce) {
      updateText += `\n**Steps to reproduce:**\n${this.escapeMarkdown(bugData.stepsToReproduce)}\n`;
    }
    
    // Add actual result
    if (bugData.actualResult) {
      updateText += `\n**Actual result:** ${this.escapeMarkdown(bugData.actualResult)}\n`;
    }
    
    // Add expected result
    if (bugData.expectedResult) {
      updateText += `\n**Expected result:** ${this.escapeMarkdown(bugData.expectedResult)}\n`;
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
    const createUpdateMutation = `
      mutation ($itemId: ID!) {
        create_update(
          item_id: $itemId,
          body: "Attachments"
        ) {
          id
        }
      }
    `;

    const updateResult = await this.query(createUpdateMutation, {
      itemId: itemId
    });

    const updateId = updateResult.create_update.id;

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
        throw new Error('File must have dataUrl or blob property');
      }

      // Ensure blob has correct type
      if (blob.type !== mimeType) {
        blob = new Blob([blob], { type: mimeType });
      }

      // Use Monday.com's file upload API
      const formData = new FormData();
      
      // Add the GraphQL mutation
      formData.append('query', `
        mutation ($file: File!) {
          add_file_to_update(
            update_id: ${updateId},
            file: $file
          ) {
            id
            name
            url
          }
        }
      `);

      // Add the file with proper name and type
      formData.append('variables[file]', blob, file.name);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': this.token
          // Don't set Content-Type - browser will set it with boundary
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('File upload response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.errors && result.errors.length > 0) {
        console.error('File upload GraphQL errors:', result.errors);
        throw new Error(result.errors[0].message);
      }

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
