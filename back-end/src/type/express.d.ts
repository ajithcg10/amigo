import { UserDocument } from "./userModelType";

declare global {
    namespace Express {
      interface Request {
        user?: UserDocument;
      }
    }
  }
  