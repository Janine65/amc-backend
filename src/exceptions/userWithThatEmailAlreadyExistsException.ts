import { GlobalHttpException } from "./globalHttpException";

class UserWithThatEmailAlreadyExistsException extends GlobalHttpException {
    constructor(email: string) {
        super(403, "User with email " + email + " already exists");
      }
    }
    
export default UserWithThatEmailAlreadyExistsException;