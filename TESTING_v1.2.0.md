# Testing Checklist - Version 1.2.0

## 🧪 Boards Configuration Update Testing

Follow this checklist to verify all new features work correctly.

---

## ✅ Pre-Testing Setup

- [ ] Extension reloaded in Chrome (`chrome://extensions/` → Reload button)
- [ ] Console open (F12 → Console tab)
- [ ] Monday.com account with API token ready
- [ ] Multiple boards/workspaces available (ideally 10+ boards)

---

## 📋 Test Cases

### 1. Pagination - Load All Boards

**Goal:** Verify all boards are loaded, not just the first page.

**Steps:**
1. Open extension settings (gear icon)
2. If not connected, enter Monday.com API token
3. Click "Test Connection"
4. Watch browser console

**Expected Results:**
- [ ] Console shows: `"Fetching all boards with pagination..."`
- [ ] Console shows: `"Fetching boards page 1..."`
- [ ] Console shows: `"Received X boards on page 1"`
- [ ] If you have 50+ boards, see: `"Fetching boards page 2..."`
- [ ] Console shows: `"Total boards fetched: X"`
- [ ] Board dropdown shows ALL your boards
- [ ] Count matches your actual Monday.com board count

**Test with:**
- [ ] Account with <50 boards (1 page)
- [ ] Account with 50-100 boards (2-3 pages)
- [ ] Account with 100+ boards (3+ pages)

---

### 2. Search Functionality

**Goal:** Verify search filters boards correctly.

**Steps:**
1. In Settings → Board & Group Selection
2. Locate "Search Boards" box (gray container at top)
3. Type a board name (e.g., "bug")

**Expected Results:**
- [ ] Dropdown filters as you type
- [ ] 200ms debounce (smooth typing, no lag)
- [ ] Board count updates: "Showing X of Y boards"
- [ ] Red × button appears when typing
- [ ] Only matching boards shown in dropdown
- [ ] Workspace groups still visible

**Test Cases:**

**Case 2a: Search by board name**
- Type: "bug"
- [ ] Shows only boards with "bug" in name
- [ ] Case insensitive (works with "BUG", "Bug", "bug")

**Case 2b: Search by workspace**
- Type: "marketing" (or your workspace name)
- [ ] Shows all boards in Marketing workspace
- [ ] Includes boards without "marketing" in their name

**Case 2c: Partial match**
- Type: "req"
- [ ] Shows "Requirements", "Requests", etc.
- [ ] Substring matching works

**Case 2d: No results**
- Type: "zzzzz" (nonsense)
- [ ] Dropdown shows "No boards found"
- [ ] Count shows: "Showing 0 of X boards"

**Case 2e: Clear search**
- Type something, then click red × button
- [ ] Search box clears
- [ ] All boards shown again
- [ ] × button disappears
- [ ] Focus returns to search box

---

### 3. Workspace Grouping

**Goal:** Verify boards are organized by workspace.

**Steps:**
1. Open board dropdown (after loading boards)
2. Examine structure

**Expected Results:**
- [ ] Boards grouped by workspace
- [ ] Workspace names shown as **bold optgroup labels**
- [ ] Board names indented under workspace
- [ ] Alphabetically sorted (workspace first, then boards)
- [ ] "No Workspace" category if applicable

**Example Structure:**
```
Select a board...
─────────────────
Engineering Team  ← Bold, optgroup
  • Bug Tracker   ← Indented
  • Sprint Board
Marketing Team    ← Bold, optgroup
  • Campaigns
  • Content
```

**Test with:**
- [ ] Multiple workspaces
- [ ] Single workspace
- [ ] Boards with no workspace
- [ ] After searching (groups maintained)

---

### 4. Board Count Indicator

**Goal:** Verify count updates correctly in all states.

**Expected Results:**

| State | Expected Text |
|-------|--------------|
| Loading | "Loading boards..." |
| All shown | "Showing all 45 boards" |
| Filtered | "Showing 3 of 45 boards" |
| Error | "Failed to load boards" |

**Test:**
- [ ] Shows correct total on load
- [ ] Updates when searching
- [ ] Correct singular/plural ("1 board" vs "2 boards")
- [ ] Resets when clearing search

---

### 5. Loading States

**Goal:** Verify proper feedback during loading.

**Steps:**
1. Disconnect from Monday (if connected)
2. Enter token and click "Test Connection"
3. Watch UI during load

**Expected Results:**
- [ ] Board dropdown shows "Loading boards..."
- [ ] Board dropdown disabled during load
- [ ] Board count shows "Loading boards..."
- [ ] Loading spinner visible (if implemented)
- [ ] After load, dropdown enabled
- [ ] Success state: dropdown populated
- [ ] Error state: "Failed to load boards"

---

### 6. Create Bug Page Integration

**Goal:** Verify boards load correctly in create-bug page too.

**Steps:**
1. Click "Create a new bug" from popup
2. Look at board dropdown
3. Open console

**Expected Results:**
- [ ] Console shows: `"Loading boards in create-bug..."`
- [ ] Console shows: `"Loaded X boards"`
- [ ] Boards grouped by workspace (same as settings)
- [ ] All boards present
- [ ] Selected board persisted from settings

---

### 7. Selection Persistence

**Goal:** Verify saved board selection is remembered.

**Steps:**
1. In Settings, select a board
2. Select a group
3. Click "Save Selection"
4. Close settings
5. Reopen settings
6. Open create-bug page

**Expected Results:**
- [ ] Settings: board selection preserved
- [ ] Settings: group selection preserved
- [ ] Create-bug: same board pre-selected
- [ ] Create-bug: same group pre-selected

---

### 8. Error Handling

**Goal:** Verify errors are handled gracefully.

**Test Cases:**

**Case 8a: Invalid token**
- Use invalid/expired token
- [ ] Error message shown
- [ ] "Failed to load boards"
- [ ] Dropdown not populated

**Case 8b: Network error**
- Disconnect internet, try to load boards
- [ ] Graceful error handling
- [ ] No console exceptions
- [ ] User-friendly message

**Case 8c: Monday API down**
- (Hard to test, but check error handling)
- [ ] Error caught and displayed
- [ ] Extension doesn't crash

---

### 9. Performance

**Goal:** Verify acceptable performance.

**Expected:**
- [ ] 50 boards: load in <2 seconds
- [ ] 100 boards: load in <4 seconds
- [ ] Search response: <50ms (instant feel)
- [ ] No lag when typing in search
- [ ] Smooth scrolling in dropdown
- [ ] No memory leaks (check task manager)

---

### 10. UI/UX Polish

**Goal:** Verify professional appearance.

**Expected:**
- [ ] Search box has gray background (stands out)
- [ ] Search icon (🔍) visible on right
- [ ] Clear button (×) red, visible when typing
- [ ] Board count text styled (purple/blue)
- [ ] Dropdown scrollable if many boards
- [ ] Consistent spacing throughout
- [ ] No visual glitches
- [ ] Responsive to window resize

---

## 🎯 Acceptance Criteria

All of these must be true to pass:

- ✅ **All boards loaded** - Pagination fetches every board
- ✅ **Search works** - Filters by board name and workspace
- ✅ **Workspace grouping** - Boards organized by workspace
- ✅ **Clear UI** - Professional, polished appearance
- ✅ **No errors** - No console errors or crashes
- ✅ **Good performance** - Fast loading and instant search
- ✅ **Persistence** - Selections saved correctly
- ✅ **Both pages** - Works in settings AND create-bug

---

## 🐛 Common Issues

### Issue: Not all boards showing

**Check:**
- Console for pagination logs
- Total count vs actual Monday.com boards
- Monday.com permissions (some boards may be restricted)

**Fix:**
- Verify token has access to all workspaces
- Check for archived boards (not loaded)

---

### Issue: Search not working

**Check:**
- Type in correct search box (gray container)
- Console for errors
- Boards loaded first

**Fix:**
- Reload extension
- Clear browser cache
- Try different search terms

---

### Issue: Workspace grouping not visible

**Check:**
- Open board dropdown
- Look for bold optgroup labels
- Check if boards have workspace data

**Fix:**
- Ensure boards are in workspaces on Monday.com
- Reload boards
- Check console for data structure

---

## 📊 Test Results Template

Use this to document your testing:

```
Date: _______________
Tester: _______________
Browser: Chrome version _______________
Extension Version: 1.2.0

Board Count: _____ boards total

✅ / ❌  Test 1: Pagination
✅ / ❌  Test 2: Search
✅ / ❌  Test 3: Workspace Grouping
✅ / ❌  Test 4: Board Count
✅ / ❌  Test 5: Loading States
✅ / ❌  Test 6: Create-Bug Integration
✅ / ❌  Test 7: Selection Persistence
✅ / ❌  Test 8: Error Handling
✅ / ❌  Test 9: Performance
✅ / ❌  Test 10: UI/UX Polish

Overall Result: ✅ PASS / ❌ FAIL

Notes:
_________________________________________________
_________________________________________________
_________________________________________________
```

---

## 🚀 Quick Smoke Test (2 minutes)

If you're short on time, run this abbreviated test:

1. [ ] Reload extension
2. [ ] Open settings
3. [ ] Click "Test Connection"
4. [ ] Verify console shows pagination logs
5. [ ] Type "bug" in search box
6. [ ] Verify dropdown filters
7. [ ] Click × to clear
8. [ ] Verify all boards show again
9. [ ] Check workspace grouping in dropdown
10. [ ] Open create-bug page and verify boards load

**If all pass → Ready to use!**

---

## 📈 Success Metrics

After testing, rate these improvements:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Time to find board | ___s | ___s | __% |
| Boards visible | ___ | ___ | __% |
| User satisfaction | __/5 | __/5 | __% |
| Ease of use | __/5 | __/5 | __% |

---

**Ready to test! Good luck! 🎉**
