import { GlobalHttpException } from "./globalHttpException";

class NotAuthorizedException extends GlobalHttpException {
    constructor() {
        super(403, "You're not authorized");
      }
    }
    
export default NotAuthorizedException;