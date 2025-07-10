import TeamService from '../services/TeamService';


// create Task
export const createTeamMember = (values) => async (dispatch) => {
    try {
      const data = await TeamService.createTeamMember(values);
      dispatch({
        type: 'CREATE_TEAM_MEMBER_SUCCESS',
        payload: { data },
      });
      return { success: true }; // ✅ return success
    } catch (error) {
      dispatch({
        type: 'CREATE_TEAM_MEMBER_FAILURE',
        payload: error.response?.data?.message || 'Create team member failed',
      });
      return { success: false }; // ✅ return failure
    }
  };


  // create Project
export const getAllTeamMembers = () => async (dispatch) => {
  try {
    const data = await TeamService.getTeamMembers();
    dispatch({
      type: 'GET_TEAM_MEMBERS_SUCCESS',
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: 'GET_TEAM_MEMBERS_FAILURE',
      payload: error.response?.data?.message || 'Get team members failed',
    });
    return { success: false }; // ✅ return failure
  }
};


  // create Project
export const getAllTeamMembersForManager = () => async (dispatch) => {
  try {
    const data = await TeamService.getTeamMembersForManager();
    dispatch({
      type: 'GET_TEAM_MEMBERS_SUCCESS',
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: 'GET_TEAM_MEMBERS_FAILURE',
      payload: error.response?.data?.message || 'Get team members failed',
    });
    return { success: false }; // ✅ return failure
  }
};

// get One TEAM Member
export const getOneTeamMember = (id) => async (dispatch) => {
  try {
    const data = await TeamService.getOneTeamMember(id);
    dispatch({
      type: 'GET_ONE_TEAM_MEMBER_SUCCESS',
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: 'GET_ONE_TEAM_MEMBER_FAILURE',
      payload: error.response?.data?.message || 'get one team memeber failed',
    });
    return { success: false }; // ✅ return failure
  }
};


// create Project
export const deleteTeamMember = (id) => async (dispatch) => {
  try {
    const data = await TeamService.deleteTeamMember(id);
    dispatch({
      type: 'DELETE_TEAM_MEMBER_SUCCESS',
      payload: { data },
    });
    return { success: true }; // ✅ return success
  } catch (error) {
    dispatch({
      type: 'DELETE_TEAM_MEMBER_FAILURE',
      payload: error.response?.data?.message || 'delete team member failed',
    });
    return { success: false }; // ✅ return failure
  }
};

// edit team member
export const editTeamMember = (id,formDat) => async (dispatch) => {
    try {
      const data = await TeamService.editTeamMember(id,formDat);
      dispatch({
        type: 'EDIT_TEAM_MEMBER_SUCCESS',
        payload: { data },
      });
      return { success: true }; // ✅ return success
    } catch (error) {
      dispatch({
        type: 'EDIT_TEAM_MEMBER_FAILURE',
        payload: error.response?.data?.message || 'Edit team member failed',
      });
      return { success: false }; // ✅ return failure
    }
  };


  // edit team member
export const editTeamMemberBu = (id,valeurs) => async (dispatch) => {
    try {
      const data = await TeamService.editTeamMemberBU(id,valeurs);
      dispatch({
        type: 'EDIT_TEAM_MEMBER_BU_SUCCESS',
        payload: { data },
      });
      return { success: true }; // ✅ return success
    } catch (error) {
      dispatch({
        type: 'EDIT_TEAM_MEMBER_BU_FAILURE',
        payload: error.response?.data?.message || "Edit team member's BU failed",
      });
      return { success: false }; // ✅ return failure
    }
  };


    // edit team member
export const editTeamMemberValidation = (id,valeurs) => async (dispatch) => {
    try {
      const data = await TeamService.editTeamMemberValidation(id,valeurs);
      dispatch({
        type: 'EDIT_TEAM_MEMBER_VALIDATION_SUCCESS',
        payload: { data },
      });
      return { success: true }; // ✅ return success
    } catch (error) {
      dispatch({
        type: 'EDIT_TEAM_MEMBER_VALIDATION_FAILURE',
        payload: error.response?.data?.message || "Edit team member's account validation failed",
      });
      return { success: false }; // ✅ return failure
    }
  };

      // edit team member
export const editTeamMemberManager = (id,valeurs) => async (dispatch) => {
    try {
      const data = await TeamService.editTeamMemberManager(id,valeurs);
      dispatch({
        type: 'EDIT_TEAM_MEMBER_MANAGER_SUCCESS',
        payload: { data },
      });
      return { success: true }; // ✅ return success
    } catch (error) {
      dispatch({
        type: 'EDIT_TEAM_MEMBER_MANAGER_FAILURE',
        payload: error.response?.data?.message || "Edit team member's account validation failed",
      });
      return { success: false }; // ✅ return failure
    }
  };


  // create Project
export const teamReset = () => async (dispatch) => {
    dispatch({
      type: 'TEAM_RESET',
      payload: {},
    });
};

