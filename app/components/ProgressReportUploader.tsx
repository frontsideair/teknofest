import { useRef, useState } from "react";
import { Group, Text, useMantineTheme } from "@mantine/core";
import type { MantineTheme } from "@mantine/core";
import { Upload, X, FileText } from "tabler-icons-react";
import type { Icon as TablerIcon } from "tabler-icons-react";
import { PDF_MIME_TYPE, Dropzone } from "@mantine/dropzone";
import type { DropzoneStatus } from "@mantine/dropzone";
import { useLoading } from "~/utils/hooks";

function getIconColor(status: DropzoneStatus, theme: MantineTheme) {
  return status.accepted
    ? theme.colors[theme.primaryColor]?.[theme.colorScheme === "dark" ? 4 : 6]
    : status.rejected
    ? theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]
    : theme.colorScheme === "dark"
    ? theme.colors.dark[0]
    : theme.colors.gray[7];
}

function ImageUploadIcon({
  status,
  ...props
}: React.ComponentProps<TablerIcon> & { status: DropzoneStatus }) {
  if (status.accepted) {
    return <Upload {...props} />;
  }

  if (status.rejected) {
    return <X {...props} />;
  }

  return <FileText {...props} />;
}

export const dropzoneChildren = (
  status: DropzoneStatus,
  theme: MantineTheme
) => (
  <Group
    position="center"
    spacing="xl"
    style={{ minHeight: 220, pointerEvents: "none" }}
  >
    <ImageUploadIcon
      status={status}
      style={{ color: getIconColor(status, theme) }}
      size={80}
    />

    <div>
      <Text size="xl" inline>
        Progress report
      </Text>
      <Text size="sm" color="dimmed" inline mt={7}>
        It should be a single PDF file that is at most 60MB in size.
      </Text>
    </div>
  </Group>
);

export default function ProgressReportUploader() {
  const theme = useMantineTheme();
  const loading = useLoading();
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const [selectStatus, setSelectStatus] = useState<DropzoneStatus>({
    accepted: false,
    rejected: false,
  });

  return (
    <Dropzone
      name="progressReport"
      loading={loading}
      multiple={false}
      ref={dropzoneRef}
      onDrop={() => setSelectStatus({ accepted: true, rejected: false })}
      onReject={() => {
        setSelectStatus({ accepted: false, rejected: true });
        dropzoneRef.current?.getElementsByTagName("input")[0]?.form?.reset();
      }}
      maxSize={60_000_000}
      accept={PDF_MIME_TYPE}
    >
      {(status) =>
        dropzoneChildren(
          {
            accepted: status.accepted || selectStatus.accepted,
            rejected: status.rejected || selectStatus.rejected,
          },
          theme
        )
      }
    </Dropzone>
  );
}
