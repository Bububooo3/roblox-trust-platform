import { CAlert, CAlertHeading, CButton } from "@coreui/react";
import { frontendDomain } from "../../util/constants";

export function NotFoundPage({ details }: { details: React.ReactNode }) {
  return (
    <>
      <br />
      <br />
      <CAlert color="danger">
        <CAlertHeading as="h1">Error 404</CAlertHeading>
        <CAlertHeading as="h2">PAGE NOT FOUND</CAlertHeading>
        <hr />
        <CAlertHeading as="h4">Details:</CAlertHeading>
        <p>{details}</p>
      </CAlert>
      <br />
      <CButton color="primary" href={frontendDomain}>Go Home</CButton>
    </>
  );
}
