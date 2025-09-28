import { AllDeleteAccountList, deleteAccountService, requestDeleteAccount } from "../services/DeleteAccount.service.js";

export const deleteAccountController = async (req, res) => {
  try {
    const userId = req.params.id; // assuming user is authenticated and userId is in req.user
console.log(userId)
    const deletedUser = await deleteAccountService(userId);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
      user: {
        _id: deletedUser._id,
        email: deletedUser.email,
        username: deletedUser.username
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const requestForAccountDelete = async (req, res) => {
  try {
    const userId = req.headers.user_id; 
    const user = await requestDeleteAccount(userId);

    res.json({
      message: "Your account will be deleted in 10 days",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const AllDeleteAccountListController=async(req,res)=>{
  try {
    const allAccount= await AllDeleteAccountList();
    res.json({Account: allAccount})
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
}
