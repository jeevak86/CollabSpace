// Deterministic Finite Automaton (DFA) for document lifecycle operations.
export const STATES = ["VIEWING", "EDITING", "SAVING", "SAVED", "LOCKED"];
export const ALPHABET = [
  "EDIT", "SAVE", "SAVE_SUCCESS", "SAVE_FAILURE",
  "LOCK", "UNLOCK", "CLOSE", "CANCEL"
];
export const INITIAL_STATE = "VIEWING";
export const ACCEPTING_STATES = ["VIEWING", "SAVED", "LOCKED"];

export const transitions = Object.freeze({
  VIEWING: { EDIT: "EDITING", LOCK: "LOCKED" },
  EDITING: { SAVE: "SAVING", LOCK: "LOCKED", CANCEL: "VIEWING" },
  SAVING: { SAVE_SUCCESS: "SAVED", SAVE_FAILURE: "EDITING" },
  SAVED: { EDIT: "EDITING", LOCK: "LOCKED", CLOSE: "VIEWING" },
  LOCKED: { UNLOCK: "SAVED" }
});

export function transition(currentState, action) {
  if (!STATES.includes(currentState) || !ALPHABET.includes(action)) {
    return { accepted: false, state: currentState, message: "Unknown state or input symbol" };
  }
  const nextState = transitions[currentState]?.[action];
  if (!nextState) {
    return { accepted: false, state: currentState, message: `Transition ${currentState} --${action}--> is not defined` };
  }
  return { accepted: true, state: nextState, message: "Valid DFA transition" };
}
