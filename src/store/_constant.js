// loading
export const GET_LOADING_DATA = 'GET_LOADING_DATA'
export const SET_COUNT = 'SET_COUNT'
export const GET_PROGRESS = 'GET_PROGRESS'
export const GET_CIRCLE = 'GET_CIRCLE'
export const GET_MESSAGE = 'GET_MESSAGE'
export const SET_MESSAGE = 'SET_MESSAGE'
export const GET_DEFAULT_MESSAGE = 'GET_DEFAULT_MESSAGE'
export const ENABLE_MESSAGE = 'ENABLE_MESSAGE'
export const HAVE_MESSAGE = 'HAVE_MESSAGE'

// user
export const UPDATE_AUTH_DATA = 'UPDATE_AUTH_DATA'
export const SAVE_AUTH_DATA = 'SAVE_AUTH_DATA'
export const GET_AUTH_DATA = 'GET_AUTH_DATA'
export const ADD_NEW_AVATAR_URL = 'ADD_NEW_AVATAR_URL'
export const SAVE_NEW_AVATAR_URL = 'SAVE_NEW_AVATAR_URL'
export const GET_AVATAR_URL = 'GET_AVATAR_URL'
export const EDIT_USER_ID = 'EDIT_USER_ID'
export const UPDATE_USER_ID = 'UPDATE_USER_ID'
export const EDIT_USER_INFO = 'EDIT_USER_INFO'
export const UPDATE_CAN_CREATE_CLIENT_FLAG = 'UPDATE_CAN_CREATE_CLIENT_FLAG'
export const GET_USER_ID = 'GET_USER_ID'
export const SAVE_USER_ROLE = 'SAVE_USER_ROLE'
export const GET_ROLE_INFO = 'GET_ROLE_INFO'
export const GET_USER_EMAIL = 'GET_USER_EMAIL'
export const GET_TOKEN = 'GET_TOKEN'
export const UPDATE_TOKEN = 'UPDATE_TOKEN'

// client
export const UPDATE_CLIENTS_DATA = 'UPDATE_CLIENTS_DATA'
export const EDIT_CLIENTS_DATA = 'EDIT_CLIENTS_DATA'
export const ADD_NEW_CLIENT = 'ADD_NEW_CLIENT'
export const SAVE_NEW_CLIENT = 'SAVE_NEW_CLIENT'
export const EDIT_CURRENT_CLIENT_MODULES = 'EDIT_CURRENT_CLIENT_MODULES'
export const UPDATE_CURRENT_CLIENT_MODULES = 'UPDATE_CURRENT_CLIENT_MODULES'
export const GET_CURRENT_CLIENT = 'GET_CURRENT_CLIENT'
export const UPDATE_SPECIFIC_CLIENT = 'UPDATE_SPECIFIC_CLIENT'
export const EDIT_SPECIFIC_CLIENT = 'EDIT_SPECIFIC_CLIENT'
export const GET_CLIENTS_BY_USER = 'GET_CLIENTS_BY_USER'
export const CAN_CREATE_CLIENT = 'CAN_CREATE_CLIENT'
export const ORDER_CLIENTS = 'ORDER_CLIENTS'
export const SWITCH_CLIENT = 'SWITCH_CLIENT'
export const EDIT_CLIENT_MODULES = 'EDIT_CLIENT_MODULES'
export const FETCH_ROLE_IN_WORKSPACE = 'FETCH_ROLE_IN_WORKSPACE'

// modules
export const UPDATE_CURRENT_CHANNEL = 'UPDATE_CURRENT_CHANNEL'
export const EDIT_CURRENT_CHANNEL = 'EDIT_CURRENT_CHANNEL'
export const GET_CURRENT_CHANNEL = 'GET_CURRENT_CHANNEL'

// reset
export const RESET_ORG = 'RESET_ORG'
export const RESET_CLIENT = 'RESET_CLIENT'

// org
export const SAVE_CURRENT_ORG = 'SAVE_CURRENT_ORG'
export const SAVE_ORGS_LIST = 'SAVE_ORGS_LIST'
export const GET_ORGS_BY_USER = 'GET_ORGS_BY_USER'
export const GET_CURRENT_ORG = 'GET_CURRENT_ORG'
export const ADD_ORG = 'ADD_ORG'
export const UPDATE_ORG = 'UPDATE_ORG'
export const ORDER_ORGS = 'ORDER_ORGS'
export const UPDATE_CLIENT_ORG = 'UPDATE_CLIENT_ORG'
export const ADD_CLIENT_ORG = 'ADD_CLIENT_ORG'
export const ORDER_CLIENTS_ORG = 'ORDER_CLIENTS_ORG'
export const SAVE_ORG_PARAM = 'SAVE_ORG_PARAM'
export const GET_ORG_PARAM = 'GET_ORG_PARAM'
export const GET_ACTIVITIES_LIST = 'GET_ACTIVITIES_LIST'

export const GET_ACTIVITIES_LOADING = 'GET_ACTIVITIES_LOADING'
export const SET_ACTIVITIES_LOADING = 'SET_ACTIVITIES_LOADING'

// error handle
export const GET_GLOBAL_TOAST_INFO = 'GET_GLOBAL_TOAST_INFO'
export const SAVE_GLOBAL_TOAST_INFO = 'SAVE_GLOBAL_TOAST_INFO'
export const DISMISS_GLOBAL_TOAST_INFO = 'DISMISS_GLOBAL_TOAST_INFO'
export const SAVE_ERROR_NETWORK_TOAST_INFO = 'SAVE_ERROR_NETWORK_TOAST_INFO'
export const GET_ERROR_NETWORK_TOAST_INFO = 'GET_ERROR_NETWORK_TOAST_INFO'
export const RESET_ERROR_NETWORK_TOAST_INFO = 'RESET_ERROR_NETWORK_TOAST_INFO'
export const HIDE_NETWORK_ERROR_IF_SHOWING = 'HIDE_NETWORK_ERROR_IF_SHOWING'

// login by google account
export const CHECK_ASSOCIATION_ACCOUNT = 'CHECK_ASSOCIATION_ACCOUNT'
export const ASSOCIATE_ACCOUNT = 'ASSOCIATE_ACCOUNT'
export const GOOGLE_LOGIN_INFO = 'GOOGLE_LOGIN_INFO'
export const CHECK_PASSWORD_ASSOCIATE = 'CHECK_PASSWORD_ASSOCIATE'
export const RESET_GOOGLE_LOGIN_INFO = 'RESET_GOOGLE_LOGIN_INFO'

// billing
export const FETCH_PLAN_LIST = 'FETCH_PLAN_LIST'
export const FETCH_COMPARE_PLAN_CONFIGS = 'FETCH_COMPARE_PLAN_CONFIGS'
export const FETCH_BILLING_SESSION = 'FETCH_BILLING_SESSION'
export const FETCH_PAYMENT_METHODS_SESSION = 'FETCH_PAYMENT_METHODS_SESSION'
export const FETCH_BALANCE_SESSION = 'FETCH_BALANCE_SESSION'
export const FETCH_REQUEST_UNSUBSCRIBE = 'FETCH_REQUEST_UNSUBSCRIBE'
export const FETCH_PREVIEW_UP_DOWN_SUBSCRIPTION = 'PREVIEW_UP_DOWN_SUBSCRIPTION'
export const FETCH_REQUEST_UP_DOWN_GRADE = 'FETCH_REQUEST_UP_DOWN_GRADE'
export const FETCH_AND_STORE_BILLING_SUBSCRIPTION_LIST = 'FETCH_AND_STORE_BILLING_SUBSCRIPTION_LIST'
export const FETCH_PAYMENT_METHODS = 'FETCH_PAYMENT_METHODS'
export const FETCH_MODIFY_PAYMENT_METHOD = 'FETCH_MODIFY_PAYMENT_METHOD'
export const FETCH_REMOVE_PAYMENT_METHOD = 'FETCH_REMOVE_PAYMENT_METHOD'
export const ACTION_UPDATE_SUBSCRIPTION_DATA = 'ACTION_UPDATE_SUBSCRIPTION_DATA'
export const ACTION_CHANGE_FIRST_CHECK = 'ACTION_CHANGE_FIRST_CHECK'
export const ACTION_REGISTER_PLAN = 'ACTION_REGISTER_SUBSCRIPTION'
export const ACTION_TOP_UP = 'ACTION_TOP_UP'
export const MUTATION_FIRST_CHECK = 'MUTATION_FIRST_CHECK'
export const MUTATION_BILLING_SUBSCRIPTION_LIST = 'MUTATION_BILLING_SUBSCRIPTION_LIST'
export const MUTATION_BILLING_SUBSCRIPTION_LOADING_STATUS = 'MUTATION_BILLING_SUBSCRIPTION_LOADING_STATUS'
export const MUTATION_BILLING_SUBSCRIPTION_DATA = 'MUTATION_BILLING_SUBSCRIPTION_DATA'
export const MUTATION_REGISTER_PLAN = 'MUTATION_REGISTER_SUBSCRIPTION'
export const MUTATION_BALANCE = 'MUTATION_BALANCE'
export const GET_BILLING_SUBSCRIPTION_BY_ORGANIZATION_ID = 'GET_BILLING_SUBSCRIPTION_BY_ORGANIZATION'
export const GET_BILLING_SUBSCRIPTION_LOADING_STATUS = 'GET_BILLING_SUBSCRIPTION_LOADING_STATUS'
export const GET_REGISTER_PLAN = 'GET_REGISTER_SUBSCRIPTION'
export const GET_FIRST_CHECK = 'GET_FIRST_CHECK'

// auth
export const GET_AUTH = 'GET_AUTH'
export const MUTATION_SET_AUTH = 'MUTATION_SET_AUTH'

// user preference
export const GET_CLIENTS_VIEW_OPTION = 'GET_CLIENTS_VIEW_OPTION'
export const SAVE_CLIENTS_VIEW_OPTION = 'SAVE_CLIENTS_VIEW_OPTION'

// workspace
export const SET_LIST_WORKSPACE = 'SET_LIST_WORKSPACE'
export const UPDATE_WORKSPACE = 'UPDATE_WORKSPACE'
export const GET_LIST_WORKSPACE = 'GET_LIST_WORKSPACE'
export const GET_FILTER_WORKSPACE = 'GET_FILTER_WORKSPACE'
export const APPLY_WORKSPACE_FILTER = 'APPLY_WORKSPACE_FILTER'
export const SEARCH_INDEX = 'SEARCH_INDEX'
export const RESET_SEARCH = 'RESET_SEARCH'
export const SET_DEFAULT_SEARCH = 'SET_DEFAULT_SEARCH'
export const SET_LOADING_WORKSPACE = 'SET_LOADING_WORKSPACE'
export const GET_LOADING_WORKSPACE = 'GET_LOADING_WORKSPACE'
