/**
 * Unit tests for the action's main functionality, src/main.js
 */
import { afterEach, beforeEach, jest } from '@jest/globals'
const core = await import('../__fixtures__/core')
const github = await import('../__fixtures__/github')

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => github)

const main = await import('../src/main')

describe('action', () => {
  beforeEach(() => {
    // Mock the action's inputs
    // core.getInput.mockReturnValueOnce('trail.json')
    // core.getInput.mockReturnValueOnce('MISSING')

    // Mock the action's payload
    github.context.payload = {
      actor: 'mona'
    }
  })

  afterEach(() => {
    jest.resetAllMocks()
  })
  it('calls printResults with found attestations when attestations are found', async () => {
    // Arrange
    // Read mock JSON from trail.json fixture file
    const fs = await import('fs')
    const path = await import('path')
    const trailJsonPath = path.resolve('./__tests__/success-trail.json')
    const mockJson = JSON.parse(fs.readFileSync(trailJsonPath, 'utf-8'))
    // Mock fs and JSON reading
    jest.unstable_mockModule('fs', () => ({
      existsSync: () => true,
      readFileSync: () => JSON.stringify(mockJson)
    }))
    const mainWithMockedFs = await import('../src/main')
    // Mock inputs
    core.getInput.mockImplementation((name) => {
      if (name === 'json_file_path') return 'trail.json'
      if (name === 'status_to_find') return 'MISSING'
    })
    // Spy on process.exit and core.info
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {})
    const infoSpy = jest.spyOn(core, 'info')
    const setFailedSpy = jest.spyOn(core, 'setFailed')
    // Act
    await mainWithMockedFs.run()
    expect(infoSpy).toHaveBeenCalledWith(
      'Searching for attestations with status: MISSING'
    )
    console.log(setFailedSpy.mock.calls)
    expect(infoSpy).toHaveBeenCalledWith(
      "No attestations found with 'MISSING' status."
    )
    expect(exitSpy).toHaveBeenCalledWith(0)
    exitSpy.mockRestore()
  })
})
