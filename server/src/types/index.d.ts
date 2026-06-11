import { Server } from "socket.io";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "rider" | "driver" | "both";
        [key: string]: any;
      };
      io?: Server;
    }
  }
}
