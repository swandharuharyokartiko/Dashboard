import fs from 'fs';

async function main() {
  const url = "https://script.google.com/macros/s/AKfycbxhj2wqhEIfaS0oLqr9Y0lp5K4A2sdGuypPYVmFq7wmIhhhiZ-TfJFxtk79o6DH8_Rz/exec";
  const response = await fetch(url);
  const data = await response.json();
  console.log("Total length:", data.length);
  if (data.length > 0) {
    console.log("First item:", data[0]);
  }
}

main().catch(console.error);
