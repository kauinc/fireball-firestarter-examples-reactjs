/**
 * Commands the dashboard writes for the Unreal runtime (`runtime_commands.command_type`).
 * Unreal acknowledges these; they are not LiveKit data packets.
 */
export const RuntimeCommand = Object.freeze({
  UNKNOWN: 'UNKNOWN',
  PREPARE_ROUND: 'PREPARE_ROUND',
  SET_TRACK_DATA: 'SET_TRACK_DATA',
  CANCEL_ROUND: 'CANCEL_ROUND',
  RESET_RUNTIME: 'RESET_RUNTIME',
  START_RACE: 'START_RACE',
  CONSOLE_COMMAND: 'CONSOLE_COMMAND',
})

/** Values seen on `runtime_commands` completion / status fields. */
export const RuntimeCommandStatus = Object.freeze({
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  IGNORED: 'IGNORED',
  UNKNOWN: 'UNKNOWN',
})
