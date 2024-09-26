import { GlobalHttpException } from "./globalHttpException";

class WrongAuthenticationTokenException extends GlobalHttpException {
    constructor() {
        super(403, "Wrong authentication token");
      }
    }
    
export default WrongAuthenticationTokenException;