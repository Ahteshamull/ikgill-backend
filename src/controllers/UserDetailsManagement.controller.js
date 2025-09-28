import { getAllUsersService,getUserById,getUserStatsService, toggleUserStatusService } from "../services/UserDetailsManagement.service.js";

export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsersService();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params; 
    console.log(id,"kd")
    // Get user ID from route params
    const user = await getUserById(id);
    console.log(user)

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};


export const ToggleUserStatus=async(req,res)=>{
    try {
      const { userId } = req.body;
      const updatedUserStatus = await toggleUserStatusService(userId);
      res.status(200).json({ success: true, report: updatedUserStatus });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };





export const getUserStatsController = async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await getUserStatsService(userId);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
