import React, { Suspense, useCallback, useRef, useState } from "react";
import styled from "styled-components";

import { Spinner } from "components";

import { JobsWithJobs } from "pages/ConnectionPage/pages/ConnectionItemPage/components/JobsList";

import { useAttemptLink } from "./attemptLinkUtils";
import ContentWrapper from "./components/ContentWrapper";
import ErrorDetails from "./components/ErrorDetails";
import MainInfo from "./components/MainInfo";
import styles from "./JobItem.module.scss";
import { AttemptRead, JobStatus, SynchronousJobRead } from "../../core/request/AirbyteClient";

const Item = styled.div<{ isFailed: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.greyColor20};
  font-size: 15px;
  line-height: 18px;

  &:hover {
    background: ${({ theme, isFailed }) => (isFailed ? theme.dangerTransparentColor : theme.greyColor0)};
  }
`;

interface JobItemProps {
  job: SynchronousJobRead | JobsWithJobs;
}

const didJobSucceed = (job: SynchronousJobRead | JobsWithJobs): boolean =>
  "status" in job ? (job?.status === JobStatus?.succeeded ? true : false) : getJobStatus(job) !== "failed";

export const getJobStatus: (job: SynchronousJobRead | JobsWithJobs) => JobStatus = (job) => {
  if ("status" in job) {
    switch (
      job.status // Removed optional chaining here
    ) {
      case JobStatus.succeeded:
        return JobStatus.succeeded;
      case JobStatus.failed:
        return JobStatus.failed;
      case JobStatus.running:
        return JobStatus.running;
      case JobStatus.cancelled:
        return JobStatus.cancelled;
      case JobStatus.waiting:
        return JobStatus.waiting;
      default:
        // Handle unknown job statuses (optional)
        return JobStatus.notstarted; // Or throw an error if unknown status is critical
    }
  } else {
    // Handle missing "status" property (optional)
    throw new Error("Required 'status' property is missing in job object"); // Throwing an error for explicit handling
  }
};
// export const getJobStatus: (job: SynchronousJobRead | JobsWithJobs) => JobStatus = (job) =>
// "status" in job && job?.status === JobStatus?.succeeded ? JobStatus?.succeeded : JobStatus?.failed;

export const getJobAttemps: (job: SynchronousJobRead | JobsWithJobs) => AttemptRead[] | undefined = (job) =>
  "attempts" in job ? job?.attempts : undefined;

export const getJobId = (job: SynchronousJobRead | JobsWithJobs): string | number =>
  "id" in job ? job?.id : job?.job?.id;

export const JobItem: React.FC<JobItemProps> = ({ job }) => {
  const { jobId: linkedJobId } = useAttemptLink();
  const alreadyScrolled = useRef(false);
  const [isOpen, setIsOpen] = useState(() => linkedJobId === String(getJobId(job)));
  const scrollAnchor = useRef<HTMLDivElement>(null);

  const didSucceed = didJobSucceed(job.job);

  const onExpand = () => {
    setIsOpen(!isOpen);
  };

  const onDetailsToggled = useCallback(() => {
    if (alreadyScrolled.current || linkedJobId !== String(getJobId(job))) {
      return;
    }
    scrollAnchor.current?.scrollIntoView({
      block: "start",
    });
    alreadyScrolled.current = true;
  }, [job, linkedJobId]);

  return (
    <Item isFailed={didSucceed} ref={scrollAnchor}>
      <MainInfo isOpen={isOpen} isFailed={didSucceed} onExpand={onExpand} job={job} attempts={getJobAttemps(job)} />
      <ContentWrapper isOpen={isOpen} onToggled={onDetailsToggled}>
        <div>
          <Suspense
            fallback={
              <div className={styles.logsLoadingContainer}>
                <Spinner small />
              </div>
            }
          >
            {isOpen && <ErrorDetails attempts={getJobAttemps(job)} />}
          </Suspense>
        </div>
      </ContentWrapper>
    </Item>
  );
};
