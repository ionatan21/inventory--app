

interface GmailFile {
  filename: string;
  snippet: string;
  Id: string;
  EmailId: string;
}
import { Findfile } from "../gmailapi";



import { useEffect } from "react";
function View({ gmailFileProp }: { gmailFileProp: GmailFile[] }) {

  useEffect(() => {
    console.log(Findfile);
  }
  , [Findfile]);
  return (
    <>
    <tr>
      <th>Nombre</th>
      <th>ID</th>
    </tr>
      {gmailFileProp.map((file) => (
        <tr key={file.Id} className="vista-xml">
          <td>{file.snippet}</td>
          <td>{file.EmailId}</td>
        </tr>
      ))}
    </>
  );
}

export default View;
