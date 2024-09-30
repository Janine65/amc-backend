export interface RetData {
    data: object | undefined;
    message: string;
    type: string;
  }

export interface RetDataFiles extends RetData {
    data: {files: string[]} | undefined;
}

export interface RetDataFile extends RetData {
    data: {filename: string} | undefined;
}

export interface RetDataUser extends RetData {
    cookie: string | undefined;
  }
  
  