"use client";
// pages/admin/addNotes.js
import { useState } from "react";
import styles from "./AddNotes.module.css"; // Import the CSS Module
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import app from "@/lib/firebase";
import { usePathname } from "next/navigation";
import { PDFDocument, JpegEmbedder, PDFImage, PDFName } from "pdf-lib";

const AddNotesPage = () => {
  const [name, setName] = useState("");
  const [file, setFile] = useState<any>(null); // State to hold the uploaded file
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const pathname = usePathname();

  const route = pathname.split("/course/")[1].replace("/add-notes", "");

  const handleFileChange = async (e: any) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setMessage("Please select a PDF file.");
      setSuccess(false);
      setFile(null); // Clear the file state
      return;
    }
    console.log("Selected file:", selectedFile);
    // Compress the PDF
    try {
      setFile(selectedFile);
    } catch (error) {
      console.error("PDF Compression Error:", error);
      setMessage("Error compressing PDF. Please try a different file.");
      setSuccess(false);
      setFile(null);
      return;
    }
  };

  const uploadFileToFirebase = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      setSuccess(false);
      return null;
    }

    const storage = getStorage(app); // Pass the Firebase app instance
    const storageRef = ref(storage, `notes/${file.name}`); // Unique file name
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot: any) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error: any) => {
          console.error("Firebase Upload Error:", error);
          setMessage(`Firebase Upload Error: ${error.message}`);
          setSuccess(false);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error: any) {
            console.error("Download URL Error:", error);
            setMessage(`Download URL Error: ${error.message}`);
            setSuccess(false);
            reject(error);
          }
        }
      );
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      setMessage("Uploading file...");
      const downloadURL = await uploadFileToFirebase();

      if (!downloadURL) {
        // Error message is already set in uploadFileToFirebase
        return;
      }

      setMessage("File uploaded.  Adding note details...");

      const response = await fetch(
        `https://webapi-zu6v4azneq-el.a.run.app/admin/${route}/addNotes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: downloadURL, name: name }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Note Added Successfully!");
        setSuccess(true);
        setName("");
        setFile(null);
        setUploadProgress(0);
      } else {
        setMessage(data.message || "Error adding note.");
        setSuccess(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An unexpected error occurred.");
      setSuccess(false);
    }
  };

  return (
    <div className={styles["add-notes-container"]}>
      <h1>Add Note</h1>
      {message && (
        <div
          className={`${styles["message"]} ${
            success ? styles["success"] : styles["error"]
          }`}
        >
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles["add-notes-form"]}>
        <div className={styles["form-group"]}>
          <label htmlFor="name">Note Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles["form-group"]}>
          <label htmlFor="file">Upload File:</label>
          <input
            type="file"
            id="file"
            accept="application/pdf"
            onChange={handleFileChange}
            required
          />
        </div>
        {uploadProgress > 0 && (
          <div className={styles["upload-progress"]}>
            Upload Progress: {uploadProgress.toFixed(2)}%
          </div>
        )}
        <button
          type="submit"
          className={styles["submit-button"]}
          disabled={uploadProgress > 0 && uploadProgress < 100}
        >
          Add Note
        </button>
      </form>
    </div>
  );
};

export default AddNotesPage;
