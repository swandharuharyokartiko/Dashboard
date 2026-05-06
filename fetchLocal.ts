import fetch from "node-fetch";

async function main() {
  try {
    const res = await fetch("http://localhost:3000/api/data");
    const json = await res.json();
    console.log("Status:", res.status);
    console.log("Data length:", json.length);
    if (json.length > 0) {
      console.log("First item:", json[0]);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
