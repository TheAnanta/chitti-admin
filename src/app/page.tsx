"use client";
// import Image from "next/image";
// import styles from "./page.module.css";
// import Link from "next/link";

import { useEffect, useState } from "react";

export default function Home() {
 
  return (
    <div className="content">
      <div className="header-content">
        <h1>
          Welcome to Chitti,{" "}
          <span
            style={{
              color: "#000000",
            }}
          >
            Admin
          </span>
        </h1>
        <input type="text" className="search-bar" placeholder="Search....." />
      </div>
      {/* <div className="course-head">
        <h3>Courses</h3>
        <button type="button">Add Courses +</button>
      </div> */}
      
    </div>
  );
}
