import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
  const formData = await req.formData();

  const file = formData.get("file");
  if (!file) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const reqFile = buffer.toString("base64");
  try {
    const infoResponse = await axios({
      method: "POST",
      url: "https://detect.roboflow.com/cells-detections/1",
      params: {
        api_key: process.env.NEXT_PUBLIC_ROBOFLOW_API_KEY,
      },
      data: reqFile,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const imageResponse = await axios({
      method: "POST",
      url: "https://detect.roboflow.com/cells-detections/1?format=image",
      params: {
        api_key: process.env.NEXT_PUBLIC_ROBOFLOW_API_KEY,
      },
      data: reqFile,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      responseType: "arraybuffer",
    });

    return NextResponse.json({
      Message: "Success",
      status: 201,
      data: infoResponse.data,
      img: imageResponse.data,
    });
  } catch (error) {
    console.log("Error occured ", error);
    return NextResponse.json({ Message: "Failed", status: 500 });
  }
}
