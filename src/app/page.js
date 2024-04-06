"use client";

import { ButtonLoading } from "@/components/ButtonLoading";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ZoomImage from "@/components/ZoomImage";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const [img, setImg] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [cellData, setCellData] = useState(null);
  const [cellImage, setCellImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImg(file);

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl("");
      setImg(null);
    }
  };

  const handleSubmitClick = async () => {
    if (img) {
      console.log("File to process: ", img);
      console.log(typeof img);

      const data = new FormData();
      data.append("file", img);

      try {
        setIsLoading(true);
        const response = await fetch("/api/segment", {
          method: "POST",
          body: data,
        });

        const res = await response.json();
        console.log(res);
        setCellData(res.data);
        const cellImg = Buffer.from(res.img).toString("base64");
        setCellImage(cellImg);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    } else {
      console.log("No file selected");
    }
  };

  const handleClearClick = () => {
    if (img && previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      setImg(null);
      setCellData(null);
      setCellImage("");
    }
  };
  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-start p-6 gap-y-6">
        <Hero />
        <div className="flex flex-col items-center justify-center gap-y-4 mt-16">
          <h1 className="text-3xl font-bold">Cell counter</h1>

          {previewUrl === "" ? (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="p-5 flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          ) : null}

          <div className="flex items-center justify-center gap-x-12">
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="..." />
            )}
            {cellImage && (
              <>
                <ZoomImage
                  image={`data:image/jpeg;base64,${cellImage}`}
                  alt="Description"
                />
              </>
            )}
          </div>

          {cellData ? (
            <div>
              <p className="text-3xl font-bold">
                Total cell count:{" "}
                {cellData ? cellData.predictions.length : "..."}
              </p>
            </div>
          ) : null}

          {isLoading ? (
            <ButtonLoading />
          ) : (
            !cellImage && (
              <Button
                className="px-8 py-4 text-lg font-bold"
                onClick={handleSubmitClick}
              >
                Submit
              </Button>
            )
          )}

          {previewUrl && (
            <Button
              variant="outline"
              className="px-8 border-2 py-4 text-lg font-bold"
              onClick={handleClearClick}
            >
              Clear
            </Button>
          )}
        </div>
      </main>
    </>
  );
}
