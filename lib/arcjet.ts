import arcjet, { tokenBucket } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["userId"], // track based on clerk userId
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 20,
      interval: 3600,
      capacity: 20, // allow 20 transactions per hour a day
    }),
  ],
});

export default aj;
