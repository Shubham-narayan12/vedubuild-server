import userModel from "../models/userModel.js";

//CREATE USER
export const createUserController = async (req, res) => {
  try {
    const { name, email, password, city, state, phone } = req.body;

    //EXISTINGUSER
    const existingUser = await userModel.findOne({ email });
    //validation
    if (existingUser) {
      return res.status(500).send({
        success: false,
        message: "email already Exist",
      });
    }
    const user = await userModel.create({
      name,
      email,
      password,
      city,
      state,
      phone,
    });
    res.status(201).send({
      success: true,
      message: "Register Successfull",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In register API",
    });
  }
};


//LOGIN USER
export const userLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "please provide username and password",
      });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User Not found",
      });
    }
    //CHECK PASSWORD
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Invalid password",
      });
    }
    //token
    const token = user.generateToken();

    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      })
      .send({
        success: true,
        message: "LOGIN SUCCESSFULL",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In LOGIN API",
    });
  }
};

//LOGOUT USER
export const userLogoutController = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()),
      })
      .send({
        success: true,
        message: "Logout Successfully",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In LOgout API",
      error,
    });
  }
};
