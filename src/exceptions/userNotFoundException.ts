import { GlobalHttpException } from "./globalHttpException";

class UserNotFoundException extends GlobalHttpException {
    constructor(id: number) {
        super(403, `User with id ${id} not found`);
      }
    }
    
export default UserNotFoundException;