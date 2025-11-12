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
      throw new Error('Monday.com token not set');
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.token,
        'API-Version': '2024-01'
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`Monday API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`Monday GraphQL error: ${result.errors[0].message}`);
    }

    return result.data;
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
    // First create the item
    const createQuery = `
      mutation ($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
        create_item(
          board_id: $boardId,
          group_id: $groupId,
          item_name: $itemName,
          column_values: $columnValues
        ) {
          id
          name
          url
        }
      }
    `;

    // Build column values from bug data
    const columnValues = this.buildColumnValues(bugData);

    const result = await this.query(createQuery, {
      boardId: boardId,
      groupId: groupId,
      itemName: bugData.description || 'New Bug',
      columnValues: JSON.stringify(columnValues)
    });

    const item = result.create_item;

    // Attach files to the item
    for (const attachment of attachments) {
      try {
        await this.addFileToItem(item.id, attachment);
      } catch (error) {
        console.error('Failed to attach file:', error);
      }
    }

    return item;
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

  async uploadFile(file) {
    // Monday.com file upload uses multipart/form-data
    const query = `
      mutation ($file: File!) {
        add_file_to_update(file: $file) {
          id
          url
        }
      }
    `;

    // Convert base64 or blob to File
    const formData = new FormData();
    
    if (file.dataUrl) {
      // Convert data URL to Blob
      const blob = await this.dataUrlToBlob(file.dataUrl);
      formData.append('query', query);
      formData.append('variables[file]', blob, file.name);
    } else if (file.blob) {
      formData.append('query', query);
      formData.append('variables[file]', file.blob, file.name);
    }

    const response = await fetch(this.apiUrl + '/file', {
      method: 'POST',
      headers: {
        'Authorization': this.token
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data.add_file_to_update;
  }

  async addFileToItem(itemId, file) {
    const query = `
      mutation ($itemId: ID!, $columnId: String!, $file: File!) {
        add_file_to_column(
          item_id: $itemId,
          column_id: $columnId,
          file: $file
        ) {
          id
        }
      }
    `;

    // For simplicity, use a generic 'files' column
    // In production, this should be configurable
    const columnId = 'files';

    const formData = new FormData();
    
    if (file.dataUrl) {
      const blob = await this.dataUrlToBlob(file.dataUrl);
      formData.append('query', query);
      formData.append('variables', JSON.stringify({ 
        itemId, 
        columnId 
      }));
      formData.append('file', blob, file.name);
    } else if (file.blob) {
      formData.append('query', query);
      formData.append('variables', JSON.stringify({ 
        itemId, 
        columnId 
      }));
      formData.append('file', file.blob, file.name);
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': this.token
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to add file to item: ${response.statusText}`);
    }

    return await response.json();
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
