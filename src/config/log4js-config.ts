import "dotenv/config";

// eslint-disable-next-line no-undef
const logLevel = process.env.APP_LOG_LEVEL ?? "info";

export const log4jsConfig = {
  appenders: {
    everything: {
      type: "dateFile",
      filename: "./logs/daily.log",
      keepFileExt: true,
      fileNameSep: "_",
      numBackups: 30,
    },
    out: {
      type: "stdout",
    },
  },
  categories: {
    default: {
      appenders: ["everything", "out"],
      level: logLevel,
    },
  },
};
