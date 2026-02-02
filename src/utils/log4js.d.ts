declare module "log4js" {
  export const log4js: {
    getLogger: (category?: string) => {
      info: (...args: any[]) => void;
      error: (...args: any[]) => void;
      // Add other log levels as needed
    };
  };
}
