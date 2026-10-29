import assert from 'node:assert/strict'
import {
  isOverdue,
  getRelativeDueDateInfo,
  getTodayDateString,
  getDateOffsetString,
  getWelcomeDate,
  getTimeGreeting
} from './src/utils/dateUtils.js'
import {
  generateSampleTasks,
  importTasksJSON
} from './src/utils/storage.js'

console.log('--- Running TaskFlow Comprehensive Verification Suite ---\n')

// 1. Test Date Utilities
console.log('1. Testing Date Utilities...')
const today = getTodayDateString()
const yesterday = getDateOffsetString(-1)
const tomorrow = getDateOffsetString(1)

assert.equal(typeof getWelcomeDate(), 'string')
assert.ok(getWelcomeDate().length > 10)
assert.ok(['Good morning', 'Good afternoon', 'Good evening'].includes(getTimeGreeting()))

assert.equal(isOverdue(yesterday, 'Pending'), true, 'Yesterday pending task must be overdue')
assert.equal(isOverdue(yesterday, 'Completed'), false, 'Completed task must never be overdue')
assert.equal(isOverdue(tomorrow, 'Pending'), false, 'Tomorrow task must not be overdue')
assert.equal(isOverdue('', 'Pending'), false, 'Task without due date must not be overdue')

const overdueInfo = getRelativeDueDateInfo(yesterday, 'Pending')
assert.equal(overdueInfo.isOverdue, true)
assert.equal(overdueInfo.text, 'Overdue by 1 day')

const todayInfo = getRelativeDueDateInfo(today, 'In Progress')
assert.equal(todayInfo.isOverdue, false)
assert.equal(todayInfo.text, 'Due today')

const tomorrowInfo = getRelativeDueDateInfo(tomorrow, 'Pending')
assert.equal(tomorrowInfo.isOverdue, false)
assert.equal(tomorrowInfo.text, 'Due tomorrow')

console.log('✓ Date utilities passed!\n')

// 2. Test Sample Tasks Generation
console.log('2. Testing Sample Tasks Generation...')
const sampleTasks = generateSampleTasks()
assert.ok(Array.isArray(sampleTasks))
assert.equal(sampleTasks.length, 6, 'Must generate 6 sample demo tasks')

sampleTasks.forEach((task, idx) => {
  assert.ok(task.id, `Task ${idx} must have an ID`)
  assert.ok(task.title, `Task ${idx} must have a title`)
  assert.ok(['Pending', 'In Progress', 'Completed'].includes(task.status), `Task ${idx} invalid status`)
  assert.ok(['Low', 'Medium', 'High'].includes(task.priority), `Task ${idx} invalid priority`)
  assert.ok(task.createdAt, `Task ${idx} must have createdAt timestamp`)
  assert.ok(task.updatedAt, `Task ${idx} must have updatedAt timestamp`)
})

const hasOverdue = sampleTasks.some(t => isOverdue(t.dueDate, t.status))
assert.ok(hasOverdue, 'Sample tasks must include an overdue task to demonstrate overdue alerts')

console.log('✓ Sample tasks generator passed!\n')

// 3. Test Statistics Calculation Logic
console.log('3. Testing Dashboard Statistics Calculation...')
function calculateStats(tasks) {
  const totalCount = tasks.length
  let pendingCount = 0
  let inProgressCount = 0
  let completedCount = 0
  let overdueCount = 0

  tasks.forEach(task => {
    if (task.status === 'Completed') {
      completedCount++
    } else {
      if (task.status === 'Pending') pendingCount++
      if (task.status === 'In Progress') inProgressCount++
      if (isOverdue(task.dueDate, task.status)) overdueCount++
    }
  })

  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  return { totalCount, pendingCount, inProgressCount, completedCount, overdueCount, completionPercentage }
}

const stats = calculateStats(sampleTasks)
assert.equal(stats.totalCount, 6)
assert.equal(stats.completedCount, 2)
assert.equal(stats.pendingCount, 2)
assert.equal(stats.inProgressCount, 2)
assert.equal(stats.overdueCount, 1)
assert.equal(stats.completionPercentage, 33)
console.log(`✓ Dashboard stats calculated: Total=${stats.totalCount}, Completed=${stats.completedCount} (${stats.completionPercentage}%), Overdue=${stats.overdueCount}`)
console.log('✓ Statistics calculation passed!\n')

// 4. Test Search and Filter Algorithms
console.log('4. Testing Search and Filtering Logic...')
const searchFilterResult = sampleTasks.filter(t => 
  t.title.toLowerCase().includes('github') || (t.description && t.description.toLowerCase().includes('github'))
)
assert.equal(searchFilterResult.length, 1)
assert.equal(searchFilterResult[0].title, 'Prepare GitHub Pages deployment workflow')

const priorityHighTasks = sampleTasks.filter(t => t.priority === 'High')
assert.equal(priorityHighTasks.length, 3)

const pendingOnly = sampleTasks.filter(t => t.status === 'Pending')
assert.equal(pendingOnly.length, 2)

console.log('✓ Search and filtering passed!\n')

// 5. Test JSON Backup & Import Validation
console.log('5. Testing Backup Import/Export Validation...')
const validBackupJSON = JSON.stringify({
  app: 'TaskFlow - Syntecxhub Internship',
  version: '1.0.0',
  exportedAt: new Date().toISOString(),
  tasks: [
    {
      title: 'Imported task test',
      description: 'Testing valid import mechanism',
      status: 'In Progress',
      priority: 'High',
      dueDate: tomorrow
    }
  ]
})

// Mock localStorage for node environment
globalThis.localStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null },
  setItem(k, v) { this._store[k] = String(v) },
  removeItem(k) { delete this._store[k] }
}

const imported = importTasksJSON(validBackupJSON)
assert.equal(imported.length, 1)
assert.equal(imported[0].title, 'Imported task test')
assert.ok(imported[0].id.startsWith('task_'))
assert.equal(imported[0].status, 'In Progress')

// Verify invalid schema rejection
assert.throws(() => {
  importTasksJSON(JSON.stringify({ invalid: 'data' }))
}, /Invalid backup format/)

assert.throws(() => {
  importTasksJSON(JSON.stringify([{ missingTitle: true }]))
}, /missing a valid title/)

console.log('✓ Backup import and schema validation passed!\n')

console.log('========================================================')
console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY (100% HEALTHY)')
console.log('========================================================')
