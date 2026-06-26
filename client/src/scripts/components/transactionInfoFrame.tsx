import type { transactionData } from "../../util/types";

function TransactionInfoFrame({
  details,
  index,
}: {
  details: transactionData;
  index: number;
}) {
  return (
    <div key={index}>
      <table style={{ border: "2px solid black", padding: "20px" }}>
        <tr>{details.projectName}</tr>
        <tr>{details.description}</tr>
        <hr />
        <tr>
          <td>
            {details.amountInCents}¢, {details.currency}
          </td>
        </tr>
        <tr>
          <td>Status: {details.status}</td>
        </tr>
        <hr />
        <tr>Parties</tr>
        <tr>
          <td>Client: {details.clientId}</td>
        </tr>
        <tr>
          <td>Developer: {details.developerId}</td>
        </tr>
        <br />
        <hr />
        <tr>Reviews</tr>
        <tr>
          <td>...of Client: {details.developerReviewId}</td>
        </tr>
        <tr>
          <td>...of Developer: {details.clientReviewId}</td>
        </tr>
        <br />
        <hr />
      </table>
      <div>{details.clientReviewId}</div>
      <div>{details.developerReviewId}</div>
      <div>{details.status}</div>
      <div>{details.createdAt}</div>
      <div>{details.updatedAt}</div>
      <div>{details.completedAt}</div>
    </div>
  );
}

export default TransactionInfoFrame;
