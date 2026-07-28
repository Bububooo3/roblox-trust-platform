import { CSpinner } from "@coreui/react";

function LoadingScreen({ details }: { details: React.ReactNode }) {
  return (
    <>
      <div  className="d-flex justify-content-center m-5">
        <CSpinner />
      </div>
        <br />
        <br />
        <div>{details}</div>
    </>
  );
}

export default LoadingScreen;
