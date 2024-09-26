import { GlobalHttpException } from "./globalHttpException";

class WrongCredentialsException extends GlobalHttpException {
    constructor() {
        super(403, "Wrong credentials provided");
      }
    }
    
export default WrongCredentialsException;