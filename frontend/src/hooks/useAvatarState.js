import { useReducer, useCallback } from 'react';

// Avatar states
export const AVATAR_STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  SPEAKING: 'speaking',
  THINKING: 'thinking',
  CELEBRATING: 'celebrating'
};

// Avatar actions
export const AVATAR_ACTIONS = {
  START_LISTENING: 'START_LISTENING',
  STOP_LISTENING: 'STOP_LISTENING',
  START_THINKING: 'START_THINKING',
  START_SPEAKING: 'START_SPEAKING',
  STOP_SPEAKING: 'STOP_SPEAKING',
  CELEBRATE: 'CELEBRATE',
  RESET_TO_IDLE: 'RESET_TO_IDLE'
};

// State transition map
const stateTransitions = {
  [AVATAR_STATES.IDLE]: {
    [AVATAR_ACTIONS.START_LISTENING]: AVATAR_STATES.LISTENING,
    [AVATAR_ACTIONS.START_THINKING]: AVATAR_STATES.THINKING,
    [AVATAR_ACTIONS.START_SPEAKING]: AVATAR_STATES.SPEAKING,
    [AVATAR_ACTIONS.CELEBRATE]: AVATAR_STATES.CELEBRATING
  },
  [AVATAR_STATES.LISTENING]: {
    [AVATAR_ACTIONS.STOP_LISTENING]: AVATAR_STATES.IDLE,
    [AVATAR_ACTIONS.START_THINKING]: AVATAR_STATES.THINKING,
    [AVATAR_ACTIONS.RESET_TO_IDLE]: AVATAR_STATES.IDLE
  },
  [AVATAR_STATES.THINKING]: {
    [AVATAR_ACTIONS.START_SPEAKING]: AVATAR_STATES.SPEAKING,
    [AVATAR_ACTIONS.RESET_TO_IDLE]: AVATAR_STATES.IDLE
  },
  [AVATAR_STATES.SPEAKING]: {
    [AVATAR_ACTIONS.STOP_SPEAKING]: AVATAR_STATES.IDLE,
    [AVATAR_ACTIONS.CELEBRATE]: AVATAR_STATES.CELEBRATING,
    [AVATAR_ACTIONS.RESET_TO_IDLE]: AVATAR_STATES.IDLE
  },
  [AVATAR_STATES.CELEBRATING]: {
    [AVATAR_ACTIONS.RESET_TO_IDLE]: AVATAR_STATES.IDLE
  }
};

// Reducer function
const avatarReducer = (state, action) => {
  const nextState = stateTransitions[state]?.[action.type];

  if (nextState) {
    console.log(`Avatar state: ${state} -> ${nextState} (action: ${action.type})`);
    return nextState;
  }

  console.warn(`Invalid transition: ${state} -> ${action.type}`);
  return state;
};

// Custom hook
export const useAvatarState = (initialState = AVATAR_STATES.IDLE) => {
  const [state, dispatch] = useReducer(avatarReducer, initialState);

  const startListening = useCallback(() => {
    dispatch({ type: AVATAR_ACTIONS.START_LISTENING });
  }, []);

  const stopListening = useCallback(() => {
    dispatch({ type: AVATAR_ACTIONS.STOP_LISTENING });
  }, []);

  const startThinking = useCallback(() => {
    dispatch({ type: AVATAR_ACTIONS.START_THINKING });
  }, []);

  const startSpeaking = useCallback(() => {
    dispatch({ type: AVATAR_ACTIONS.START_SPEAKING });
  }, []);

  const stopSpeaking = useCallback(() => {
    dispatch({ type: AVATAR_ACTIONS.STOP_SPEAKING });
  }, []);

  const celebrate = useCallback(() => {
    dispatch({ type: AVATAR_ACTIONS.CELEBRATE });
  }, []);

  const resetToIdle = useCallback(() => {
    dispatch({ type: AVATAR_ACTIONS.RESET_TO_IDLE });
  }, []);

  return {
    state,
    startListening,
    stopListening,
    startThinking,
    startSpeaking,
    stopSpeaking,
    celebrate,
    resetToIdle,
    isIdle: state === AVATAR_STATES.IDLE,
    isListening: state === AVATAR_STATES.LISTENING,
    isSpeaking: state === AVATAR_STATES.SPEAKING,
    isThinking: state === AVATAR_STATES.THINKING,
    isCelebrating: state === AVATAR_STATES.CELEBRATING
  };
};
