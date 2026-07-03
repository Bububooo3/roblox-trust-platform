import { CToast, CToastBody, CToaster, CToastHeader } from "@coreui/react";

const colors = Array.of("#007aff", "#ffd900", "#ff1e00");

const Notify = ({ msg, level }: { msg: string; level: number }) => {

  alert(msg);

  return (
    <CToaster>
      <CToast autohide={false} visible={true}>
        <CToastHeader closeButton>
          <svg
            className="rounded me-2"
            width="20"
            height="20"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            focusable="false"
            role="img"
          >
            <rect
              width="100%"
              height="100%"
              fill={colors[level - 1] || colors[0]}
            ></rect>
          </svg>
          <div className="fw-bold me-auto">Notification</div>
        </CToastHeader>
        <CToastBody>{msg}</CToastBody>
      </CToast>
    </CToaster>
  );
};

export default Notify;
