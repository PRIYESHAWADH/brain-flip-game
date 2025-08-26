/**
 * Ultimate Brain Flip Experience - Enhanced State Management
 * Redux Toolkit with RTK Query for complex state management
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { encryptTransform } from 'redux-persist-transform-encrypt';

// API Services
import { gameApi } from './api/gameApi';
import { aiPersonalizationApi } from './api/aiPersonalizationApi';
import { battleApi } from './api/battleApi';
import { socialApi } from './api/socialApi';
import { analyticsApi } from './api/analyticsApi';

// Slice Reducers
import gameReducer from './slices/gameSlice';
import aiPersonalizationReducer from './slices/aiPersonalizationSlice';
import battleReducer from './slices/battleSlice';
import socialReducer from './slices/socialSlice';
import uiReducer from './slices/uiSlice';
import settingsReducer from './slices/settingsSlice';
import achievementsReducer from './slices/achievementsSlice';
import neuralAvatarReducer from './slices/neuralAvatarSlice';

// State Machine
import { gameStateMachine } from './stateMachine/gameStateMachine';

// Middleware
import { conflictResolutionMiddleware } from './middleware/conflictResolution';
import { optimisticUpdatesMiddleware } from './middleware/optimisticUpdates';
import { analyticsMiddleware } from './middleware/analytics';
import { errorHandlingMiddleware } from './middleware/errorHandling';

// Encryption for sensitive data
const encryptor = encryptTransform({
  secretKey: process.env.NEXT_PUBLIC_REDUX_ENCRYPT_KEY || 'brain-flip-default-key',
  onError: (error) => {
    console.error('Redux persist encryption error:', error);
  },
});

// Persist configuration
const persistConfig = {
  key: 'brain-flip-ultimate',
  version: 1,
  storage,
  transforms: [encryptor],
  whitelist: [
    'game',
    'aiPersonalization', 
    'settings',
    'achievements',
    'neuralAvatar'
  ],
  blacklist: [
    'battle', // Real-time data shouldn't be persisted
    'ui', // UI state is ephemeral
    'gameApi',
    'aiPersonalizationApi',
    'battleApi',
    'socialApi',
    'analyticsApi'
  ],
};

// Root reducer
const rootReducer = combineReducers({
  // Core game state
  game: gameReducer,
  aiPersonalization: aiPersonalizationReducer,
  battle: battleReducer,
  social: socialReducer,
  ui: uiReducer,
  settings: settingsReducer,
  achievements: achievementsReducer,
  neuralAvatar: neuralAvatarReducer,
  
  // State machine
  gameStateMachine: gameStateMachine.reducer,
  
  // API slices
  [gameApi.reducerPath]: gameApi.reducer,
  [aiPersonalizationApi.reducerPath]: aiPersonalizationApi.reducer,
  [battleApi.reducerPath]: battleApi.reducer,
  [socialApi.reducerPath]: socialApi.reducer,
  [analyticsApi.reducerPath]: analyticsApi.reducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['gameStateMachine'],
      },
      immutableCheck: {
        ignoredPaths: ['gameStateMachine'],
      },
    })
    .concat(
      // API middleware
      gameApi.middleware,
      aiPersonalizationApi.middleware,
      battleApi.middleware,
      socialApi.middleware,
      analyticsApi.middleware,
      
      // Custom middleware
      conflictResolutionMiddleware,
      optimisticUpdatesMiddleware,
      analyticsMiddleware,
      errorHandlingMiddleware
    ),
  devTools: process.env.NODE_ENV !== 'production' && {
    name: 'Brain Flip Ultimate Experience',
    trace: true,
    traceLimit: 25,
  },
});

// Setup RTK Query listeners
setupListeners(store.dispatch);

// Persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Store utilities
export const getState = () => store.getState();
export const dispatch = store.dispatch;

// Hot module replacement for development
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./slices', () => {
    const newRootReducer = require('./slices').default;
    store.replaceReducer(persistReducer(persistConfig, newRootReducer));
  });
}