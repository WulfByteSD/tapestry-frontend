"use client";
import React from "react";
import { Modal, Switcher } from "@tapestry/ui";
import { FaExclamationCircle } from "react-icons/fa";
import styles from "./SmsOptInModal.module.scss";

interface SmsOptInModalProps {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  businessName?: string;
  messagesPerMonth?: number;
}

const SmsOptInModal: React.FC<SmsOptInModalProps> = ({
  isVisible,
  onConfirm,
  onCancel,
  isLoading = false,
  businessName = "Tapestry TTRPG",
  messagesPerMonth = 10,
}) => {
  const [agreed, setAgreed] = React.useState(false);

  // Reset agreement state when modal opens/closes
  React.useEffect(() => {
    if (isVisible) {
      setAgreed(false);
    }
  }, [isVisible]);

  const handleConfirm = () => {
    if (agreed) {
      onConfirm();
      setAgreed(false); // Reset for next time
    }
  };

  const handleCancel = () => {
    setAgreed(false);
    onCancel();
  };

  return (
    <Modal
      title={
        <div className={styles.titleContainer}>
          <FaExclamationCircle className={styles.warningIcon} />
          <span>SMS Notifications Opt-In</span>
        </div>
      }
      open={isVisible}
      onOk={handleConfirm}
      onCancel={handleCancel}
      okText="Agree & Enable SMS"
      cancelText="Cancel"
      confirmLoading={isLoading}
      okButtonProps={{
        disabled: !agreed,
      }}
      width={500}
      centered
    >
      <div className={styles.content}>
        <div className={styles.section}>
          <h5 className={styles.sectionTitle}>SMS Opt-In Agreement</h5>
          <p className={styles.text}>
            By opting in, you agree to receive informational, marketing, and customer care related text messages from{" "}
            <strong>{businessName}</strong>. You may receive up to{" "}
            <strong>{messagesPerMonth} messages per month</strong>. Message and data rates may apply. Reply{" "}
            <strong>STOP</strong> to unsubscribe at any time.
          </p>
        </div>

        <div className={styles.section}>
          <p className={styles.textSecondary}>
            <strong>Additional Terms:</strong>
            <br />
            • Carriers are not liable for delayed or undelivered messages
            <br />
            • You can opt out at any time by replying STOP
            <br />
            • For help, reply HELP or contact customer support
            <br />• Your consent is not required to make a purchase
          </p>
        </div>

        <div className={styles.section}>
          <p className={styles.textSecondary}>
            <strong>Privacy Notice:</strong> Your information will be used in accordance with our{" "}
            <a
              href="https://thefreeagentportal.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Privacy Policy
            </a>
            . We respect your privacy and will not share your information with third parties without your consent.
          </p>
        </div>

        <div className={styles.section}>
          <p className={styles.textSecondary}>
            <strong>SMS Policy Notice:</strong> Please review our{" "}
            <a
              href="https://thefreeagentportal.com/legal/sms-terms"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              SMS Policy
            </a>
            . By opting in, you agree to comply with the terms outlined in our SMS Policy.
          </p>
        </div>

        <div className={styles.switcherContainer}>
          <Switcher
            checked={agreed}
            onChange={setAgreed}
            label="I have read and agree to the SMS opt-in terms and conditions above"
            size="md"
          />
        </div>
      </div>
    </Modal>
  );
};

export default SmsOptInModal;
