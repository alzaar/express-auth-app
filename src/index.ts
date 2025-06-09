import express from "express";
import _ from "lodash";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { Request, Response } from "express";
import { STATUS_CODES } from "http";

import utils from "./utils";

const ONE_HOUR = 3600000;
const app = express();
const { connectDB, User } = utils;

app.use(express.json());
app.use(cookieParser());

connectDB(`${process.env.DB_NAME}`);

function validateRequest(req: Request, res: Response): boolean {
  const allowedKeys = ["username", "password"];
  const bodyKeys = Object.keys(req.body);

  const hasOnlyAllowedKeys = bodyKeys.every((key) => allowedKeys.includes(key));
  const hasAllRequiredKeys = allowedKeys.every((key) => _.has(req.body, key));

  if (!hasOnlyAllowedKeys || !hasAllRequiredKeys) {
    res.status(400).json({
      message:
        'Invalid request, only "username" and "password" are valid fields.',
      status: 400,
      error: {
        message: STATUS_CODES[400],
      },
    });
    return false;
  }

  return true;
}

app.post("/register", async (req: Request, res: Response) => {
  if (!validateRequest(req, res)) return;
  const saltRounds = 10;
  try {
    User.create({
      username: req.body.username,
      password: await bcrypt.hash(req.body.password, 10),
    });
    const token = jwt.sign(
      { username: req.body.username },
      process.env.JWT_SECRET
    );
    res
      .status(204)
      .cookie("access_token", `Bearer ${token}`, {
        expires: new Date(Date.now() + ONE_HOUR / 4),
      })
      .redirect(301, "/");
  } catch (err) {}
});

app.post("/login", async (req: Request, res: Response): void => {
  if (!validateRequest(req, res)) return;
  const exists = await User.exists({ username: req.body.username });

  if (!exists) {
    res.json({
      message: "Bad request",
      status: 400,
      error: {
        message: "User doesn't exist",
      },
    });
    return;
  }

  try {
    const token = jwt.sign(
      { username: req.body.username },
      process.env.JWT_SECRET
    );
    res
      .status(204)
      .cookie("access_token", `Bearer ${token}`, {
        expires: new Date(Date.now() + ONE_HOUR / 4),
      })
      .redirect(301, "/");
  } catch (err) {
    console.error(err);
    res.send({
      message: "Server crashed!",
      status: STATUS_CODES[500],
      error: {
        message: "Internal server error",
      },
    });
  }
  return;
});

app.get("/", (req: Request, res: Response): void => {
  const access_token = req.cookies.access_token
    ? req.cookies.access_token.split(" ")[1]
    : undefined;

  const user = jwt.verify(access_token, process.env.JWT_SECRET);
  if (!user) {
    res.status(401).json({
      error: { message: "Invalid user" },
      status: 400,
      message: "Bad request",
    });
    return;
  }
  res.status(200).json({
    message: "Hello",
    error: {},
    status: STATUS_CODES[200],
  });
  return;
});

app.listen(process.env.PORT, () =>
  console.log(`Listening on ${process.env.PORT}`)
);
