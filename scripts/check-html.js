(async () => {
  const t = await (await fetch("https://hodlhotel.app/")).text();
  console.log("contain", t.includes("object-contain"));
  console.log("landing", t.includes("landing-bg.jpg"));
  console.log("cachebust", t.includes("v=3"));
  console.log("dvh", t.includes("100dvh"));
})();
