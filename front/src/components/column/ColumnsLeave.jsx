import React from "react";
import { Button, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { TagStyle } from "@/utils/TagStyle";

export const getColumns = (onDelete) => [
  {
    title: "Debut",
    dataIndex: "startDate",
    key: "startDate",
    render: (text) => dayjs(text).format("dddd DD MMMM YYYY"),
  },
  {
    title: "Fin",
    dataIndex: "endDate",
    key: "endDate",
    render: (text) => dayjs(text).format("dddd DD MMMM YYYY"),
  },
  {
    title: "Justification",
    dataIndex: "justification",
    key: "justification",
    width: "30%",
  },
  {
    title: "Nombre de jours",
    dataIndex: "daysLeave",
    key: "daysLeave",
    sorter: (a, b) => a.daysLeave - b.daysLeave,
  },
  {
    title: "Statut",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      // Déterminer la couleur selon le statut
      let color = "default";
      if (status === "Accepted" || status === "Approved") {
        color = "success";
      } else if (status === "Refused") {
        color = "error";
      } else if (status === "EnAttente" || status === "Pending") {
        color = "warning";
      }

      // Normaliser le texte du statut pour l'affichage
      let displayText = status;
      if (status === "Pending") {
        displayText = "EnAttente";
      } else if (status === "Approved") {
        displayText = "Accepted";
      }

      return <TagStyle color={color} text={displayText} />;
    },
  },
  {
    title: "Action",
    key: "action",
    width: 100,
    render: (_, record) => {
      const isPending =
        record.status === "Pending" || record.status === "EnAttente";

      if (!isPending || !onDelete) {
        return null;
      }

      return (
        <Popconfirm
          title="Supprimer la demande"
          description="Êtes-vous sûr de vouloir supprimer cette demande de congé ?"
          onConfirm={() => onDelete(record.id)}
          okText="Oui"
          cancelText="Non"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
          ></Button>
        </Popconfirm>
      );
    },
  },
];

// Export pour compatibilité avec le code existant
export const columns = getColumns();
