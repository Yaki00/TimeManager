import dayjs from "dayjs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Types de formats d'export disponibles
 */
export const EXPORT_FORMATS = {
  CSV: "csv",
  PDF: "pdf",
  JSON: "json",
};

/**
 * Constantes pour la génération PDF
 */
const PDF_CONFIG = {
  PAGE_MARGIN: 250, // Position Y maximale avant nouvelle page
  INITIAL_Y_POSITION: 20,
  TITLE_FONT_SIZE: 18,
  SECTION_FONT_SIZE: 14,
  SUBTITLE_FONT_SIZE: 10,
  HEADER_COLOR: [79, 70, 229],
  SPACING: {
    AFTER_TITLE: 10,
    AFTER_SUBTITLE: 15,
    AFTER_SECTION: 8,
    AFTER_TABLE: 15,
  },
};

/**
 * Convertit un tableau d'objets en CSV
 */
function convertToCSV(data, headers) {
  if (!data || data.length === 0) {
    return "";
  }

  // Créer la ligne d'en-tête
  const headerRow = headers.map((h) => `"${h.label}"`).join(",");

  // Créer les lignes de données
  const dataRows = data.map((row) => {
    return headers
      .map((h) => {
        const value = h.accessor ? h.accessor(row) : row[h.key];
        // Échapper les guillemets et les retours à la ligne
        const escapedValue = String(value || "").replace(/"/g, '""');
        return `"${escapedValue}"`;
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

/**
 * Télécharge un fichier via un lien temporaire
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Télécharge un fichier CSV avec BOM pour Excel
 */
function downloadCSV(csvContent, filename) {
  const BOM = "\uFEFF"; // BOM pour Excel UTF-8
  downloadFile(BOM + csvContent, filename, "text/csv;charset=utf-8;");
}

/**
 * Télécharge un fichier PDF
 */
function downloadPDF(pdf, filename) {
  try {
    if (!pdf) {
      throw new Error("Le document PDF est invalide");
    }
    pdf.save(filename);
  } catch (error) {
    console.error("Erreur lors du téléchargement du PDF:", error);
    throw new Error(`Impossible de télécharger le PDF: ${error.message}`);
  }
}

/**
 * Télécharge un fichier JSON
 */
function downloadJSON(jsonContent, filename) {
  const jsonString = JSON.stringify(jsonContent, null, 2);
  downloadFile(jsonString, filename, "application/json;charset=utf-8;");
}

/**
 * Convertit un tableau d'objets en données pour tableau PDF
 */
function arrayToTableData(data, headers) {
  if (!data || data.length === 0) {
    return {
      head: [headers.map((h) => h.label)],
      body: [],
    };
  }

  return {
    head: [headers.map((h) => h.label)],
    body: data.map((row) =>
      headers.map((h) => {
        const value = h.accessor ? h.accessor(row) : row[h.key];
        return String(value || "");
      })
    ),
  };
}

/**
 * Formate une plage de dates pour les noms de fichiers
 */
function formatDateRange(startDate, endDate) {
  if (startDate && endDate) {
    return `${dayjs(startDate).format("DD-MM-YYYY")}_${dayjs(endDate).format(
      "DD-MM-YYYY"
    )}`;
  }
  return dayjs().format("DD-MM-YYYY");
}

/**
 * Formate une heure décimale en format "XhYY"
 */
function formatDecimalTime(decimalHour) {
  const hours = Math.floor(decimalHour);
  const minutes = Math.round((decimalHour % 1) * 60);
  return `${hours}h${minutes.toString().padStart(2, "0")}`;
}

/**
 * Formate les heures d'arrivée et de départ pour l'affichage
 */
function formatArrivalDeparture(data) {
  return data.map((item) => ({
    ...item,
    arrival: formatDecimalTime(item.arrival),
    departure: formatDecimalTime(item.departure),
  }));
}

/**
 * Calcule la moyenne d'un tableau de valeurs
 */
function calculateAverage(array, key) {
  if (!array || array.length === 0) return 0;
  const sum = array.reduce((acc, curr) => acc + curr[key], 0);
  return (sum / array.length).toFixed(1);
}

/**
 * Calcule la moyenne des heures travaillées
 */
function calculateAverageHours(hoursWorked) {
  if (!hoursWorked || hoursWorked.length === 0) return "0h";
  const average = calculateAverage(hoursWorked, "hours");
  return `${average}h`;
}

/**
 * Vérifie si une nouvelle page est nécessaire et l'ajoute si besoin
 */
function checkAndAddPage(pdf, yPosition) {
  if (yPosition > PDF_CONFIG.PAGE_MARGIN) {
    pdf.addPage();
    return PDF_CONFIG.INITIAL_Y_POSITION;
  }
  return yPosition;
}

/**
 * Récupère la position Y finale après un tableau, en gérant les cas d'erreur
 */
function getFinalY(pdf, currentY, defaultSpacing) {
  if (pdf.lastAutoTable && pdf.lastAutoTable.finalY !== undefined) {
    return pdf.lastAutoTable.finalY;
  }
  // Si lastAutoTable n'existe pas, retourner la position actuelle plus l'espacement
  return currentY + defaultSpacing;
}

/**
 * Exporte les KPI Responsable
 */
export function exportResponsableKPIs(
  kpiData,
  startDate,
  endDate,
  format = EXPORT_FORMATS.CSV
) {
  const sections = [];

  // Section 1: Statistiques des congés
  if (kpiData.leaveStats && kpiData.leaveStats.length > 0) {
    sections.push("STATISTIQUES DES CONGÉS");
    sections.push(
      convertToCSV(kpiData.leaveStats, [
        { label: "Type", key: "name" },
        { label: "Pourcentage", key: "value" },
      ])
    );
    sections.push("");
  }

  // Section 2: Délai de traitement
  if (kpiData.processingTime && kpiData.processingTime.length > 0) {
    sections.push("DÉLAI MOYEN DE TRAITEMENT (jours)");
    sections.push(
      convertToCSV(kpiData.processingTime, [
        { label: "Mois", key: "month" },
        { label: "Jours", key: "days" },
      ])
    );
    sections.push("");
  }

  // Section 3: Ratio Manager/Employés
  if (kpiData.managerRatio && kpiData.managerRatio.length > 0) {
    sections.push("RATIO MANAGER/EMPLOYÉS PAR ÉQUIPE");
    sections.push(
      convertToCSV(kpiData.managerRatio, [
        { label: "Équipe", key: "team" },
        { label: "Ratio", key: "ratio" },
      ])
    );
    sections.push("");
  }

  // Section 4: Top 5 Managers
  if (kpiData.topManagers && kpiData.topManagers.length > 0) {
    sections.push("TOP 5 MANAGERS");
    const managersWithRank = kpiData.topManagers.map((manager, index) => ({
      ...manager,
      rank: index + 1,
    }));
    sections.push(
      convertToCSV(managersWithRank, [
        { label: "Rang", key: "rank" },
        { label: "Nom", key: "name" },
        { label: "Équipe", key: "team" },
        { label: "Score", key: "score" },
      ])
    );
    sections.push("");
  }

  // Section 5: Top 5 Équipes
  if (kpiData.topTeams && kpiData.topTeams.length > 0) {
    sections.push("TOP 5 ÉQUIPES");
    const teamsWithRank = kpiData.topTeams.map((team, index) => ({
      ...team,
      rank: index + 1,
    }));
    sections.push(
      convertToCSV(teamsWithRank, [
        { label: "Rang", key: "rank" },
        { label: "Nom", key: "name" },
        { label: "Meilleur membre", key: "topUser" },
        { label: "Score", key: "score" },
      ])
    );
    sections.push("");
  }

  const dateRange = formatDateRange(startDate, endDate);

  // Préparer les données structurées pour l'export
  const exportData = {
    metadata: {
      type: "Responsable",
      startDate,
      endDate,
      exportDate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    },
    sections: {
      leaveStats: kpiData.leaveStats || [],
      processingTime: kpiData.processingTime || [],
      managerRatio: kpiData.managerRatio || [],
      topManagers: kpiData.topManagers || [],
      topTeams: kpiData.topTeams || [],
    },
  };

  // Exporter selon le format
  if (format === EXPORT_FORMATS.JSON) {
    const filename = `KPI_Responsable_${dateRange}.json`;
    downloadJSON(exportData, filename);
  } else if (format === EXPORT_FORMATS.PDF) {
    try {
      const pdf = new jsPDF();
      let yPosition = PDF_CONFIG.INITIAL_Y_POSITION;

      // Titre
      pdf.setFontSize(PDF_CONFIG.TITLE_FONT_SIZE);
      pdf.text("KPI Responsable", 14, yPosition);
      yPosition += PDF_CONFIG.SPACING.AFTER_TITLE;
      pdf.setFontSize(PDF_CONFIG.SUBTITLE_FONT_SIZE);
      pdf.text(`Période: ${dateRange.replace(/_/g, " au ")}`, 14, yPosition);
      yPosition += PDF_CONFIG.SPACING.AFTER_SUBTITLE;

      // Statistiques des congés
      if (kpiData.leaveStats && kpiData.leaveStats.length > 0) {
        pdf.setFontSize(PDF_CONFIG.SECTION_FONT_SIZE);
        pdf.text("Statistiques des Congés", 14, yPosition);
        yPosition += PDF_CONFIG.SPACING.AFTER_SECTION;
        const tableData1 = arrayToTableData(kpiData.leaveStats, [
          { label: "Type", key: "name" },
          { label: "Pourcentage", key: "value" },
        ]);
        autoTable(pdf, {
          startY: yPosition,
          head: tableData1.head,
          body: tableData1.body,
          theme: "striped",
          headStyles: { fillColor: PDF_CONFIG.HEADER_COLOR },
        });
        yPosition =
          getFinalY(pdf, yPosition, PDF_CONFIG.SPACING.AFTER_TABLE) +
          PDF_CONFIG.SPACING.AFTER_TABLE;
      }

      // Délai de traitement
      if (kpiData.processingTime && kpiData.processingTime.length > 0) {
        yPosition = checkAndAddPage(pdf, yPosition);
        pdf.setFontSize(PDF_CONFIG.SECTION_FONT_SIZE);
        pdf.text("Délai Moyen de Traitement (jours)", 14, yPosition);
        yPosition += PDF_CONFIG.SPACING.AFTER_SECTION;
        const tableData2 = arrayToTableData(kpiData.processingTime, [
          { label: "Mois", key: "month" },
          { label: "Jours", key: "days" },
        ]);
        autoTable(pdf, {
          startY: yPosition,
          head: tableData2.head,
          body: tableData2.body,
          theme: "striped",
          headStyles: { fillColor: PDF_CONFIG.HEADER_COLOR },
        });
        yPosition =
          getFinalY(pdf, yPosition, PDF_CONFIG.SPACING.AFTER_TABLE) +
          PDF_CONFIG.SPACING.AFTER_TABLE;
      }

      // Ratio Manager/Employés
      if (kpiData.managerRatio && kpiData.managerRatio.length > 0) {
        yPosition = checkAndAddPage(pdf, yPosition);
        pdf.setFontSize(PDF_CONFIG.SECTION_FONT_SIZE);
        pdf.text("Ratio Manager/Employés par Équipe", 14, yPosition);
        yPosition += PDF_CONFIG.SPACING.AFTER_SECTION;
        const tableData3 = arrayToTableData(kpiData.managerRatio, [
          { label: "Équipe", key: "team" },
          { label: "Ratio", key: "ratio" },
        ]);
        autoTable(pdf, {
          startY: yPosition,
          head: tableData3.head,
          body: tableData3.body,
          theme: "striped",
          headStyles: { fillColor: PDF_CONFIG.HEADER_COLOR },
        });
        yPosition =
          getFinalY(pdf, yPosition, PDF_CONFIG.SPACING.AFTER_TABLE) +
          PDF_CONFIG.SPACING.AFTER_TABLE;
      }

      // Top 5 Managers
      if (kpiData.topManagers && kpiData.topManagers.length > 0) {
        yPosition = checkAndAddPage(pdf, yPosition);
        pdf.setFontSize(PDF_CONFIG.SECTION_FONT_SIZE);
        pdf.text("Top 5 Managers", 14, yPosition);
        yPosition += PDF_CONFIG.SPACING.AFTER_SECTION;
        const managersWithRank = kpiData.topManagers.map((manager, index) => ({
          ...manager,
          rank: index + 1,
        }));
        const tableData4 = arrayToTableData(managersWithRank, [
          { label: "Rang", key: "rank" },
          { label: "Nom", key: "name" },
          { label: "Équipe", key: "team" },
          { label: "Score", key: "score" },
        ]);
        autoTable(pdf, {
          startY: yPosition,
          head: tableData4.head,
          body: tableData4.body,
          theme: "striped",
          headStyles: { fillColor: PDF_CONFIG.HEADER_COLOR },
        });
        yPosition =
          getFinalY(pdf, yPosition, PDF_CONFIG.SPACING.AFTER_TABLE) +
          PDF_CONFIG.SPACING.AFTER_TABLE;
      }

      // Top 5 Équipes
      if (kpiData.topTeams && kpiData.topTeams.length > 0) {
        yPosition = checkAndAddPage(pdf, yPosition);
        pdf.setFontSize(PDF_CONFIG.SECTION_FONT_SIZE);
        pdf.text("Top 5 Équipes", 14, yPosition);
        yPosition += PDF_CONFIG.SPACING.AFTER_SECTION;
        const teamsWithRank = kpiData.topTeams.map((team, index) => ({
          ...team,
          rank: index + 1,
        }));
        const tableData5 = arrayToTableData(teamsWithRank, [
          { label: "Rang", key: "rank" },
          { label: "Nom", key: "name" },
          { label: "Meilleur membre", key: "topUser" },
          { label: "Score", key: "score" },
        ]);
        autoTable(pdf, {
          startY: yPosition,
          head: tableData5.head,
          body: tableData5.body,
          theme: "striped",
          headStyles: { fillColor: PDF_CONFIG.HEADER_COLOR },
        });
      }

      const filename = `KPI_Responsable_${dateRange}.pdf`;
      downloadPDF(pdf, filename);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF Responsable:", error);
      throw new Error(`Erreur lors de l'export PDF: ${error.message}`);
    }
  } else {
    // Export CSV
    const csvContent = sections.join("\n");
    const filename = `KPI_Responsable_${dateRange}.csv`;
    downloadCSV(csvContent, filename);
  }
}

/**
 * Exporte les KPI Manager
 */
export function exportManagerKPIs(
  kpiData,
  teamName,
  startDate,
  endDate,
  format = EXPORT_FORMATS.CSV
) {
  const sections = [];

  // Section 1: Statistiques générales
  sections.push("STATISTIQUES GÉNÉRALES");
  sections.push(
    convertToCSV(
      [
        { label: "Métrique", value: "Valeur" },
        {
          label: "Présence Équipe",
          value: `${kpiData.teamAttendance?.rate || 0}%`,
        },
        {
          label: "Heures Moyennes",
          value: calculateAverageHours(kpiData.hoursWorked),
        },
        {
          label: "Avertissements",
          value:
            kpiData.warnings?.reduce((acc, curr) => acc + curr.count, 0) || 0,
        },
        { label: "Membres", value: kpiData.attendance?.length || 0 },
      ],
      [
        { label: "Métrique", key: "label" },
        { label: "Valeur", key: "value" },
      ]
    )
  );
  sections.push("");

  // Section 2: Présence par membre
  if (kpiData.attendance && kpiData.attendance.length > 0) {
    sections.push("TAUX DE PRÉSENCE PAR MEMBRE");
    sections.push(
      convertToCSV(kpiData.attendance, [
        { label: "Membre", key: "name" },
        { label: "Taux (%)", key: "rate" },
      ])
    );
    sections.push("");
  }

  // Section 3: Heures travaillées
  if (kpiData.hoursWorked && kpiData.hoursWorked.length > 0) {
    sections.push("HEURES TRAVAILLÉES PAR MEMBRE");
    sections.push(
      convertToCSV(kpiData.hoursWorked, [
        { label: "Membre", key: "member" },
        { label: "Heures", key: "hours" },
      ])
    );
    sections.push("");
  }

  // Section 4: Avertissements
  if (kpiData.warnings && kpiData.warnings.length > 0) {
    sections.push("AVERTISSEMENTS PAR MEMBRE");
    sections.push(
      convertToCSV(kpiData.warnings, [
        { label: "Membre", key: "member" },
        { label: "Nombre", key: "count" },
      ])
    );
    sections.push("");
  }

  // Section 5: Temps de pause
  if (kpiData.pauseTime && kpiData.pauseTime.length > 0) {
    sections.push("TEMPS DE PAUSE MOYEN PAR MEMBRE");
    sections.push(
      convertToCSV(kpiData.pauseTime, [
        { label: "Membre", key: "member" },
        { label: "Minutes", key: "minutes" },
      ])
    );
    sections.push("");
  }

  // Section 6: Jours de congé
  if (kpiData.leaveDays && kpiData.leaveDays.length > 0) {
    sections.push("JOURS DE CONGÉ PAR MEMBRE");
    sections.push(
      convertToCSV(kpiData.leaveDays, [
        { label: "Membre", key: "member" },
        { label: "Jours", key: "days" },
      ])
    );
    sections.push("");
  }

  // Section 7: Conformité au contrat
  if (kpiData.contractCompliance && kpiData.contractCompliance.length > 0) {
    sections.push("CONFORMITÉ AU CONTRAT (% des heures)");
    const headers = [
      { label: "Mois", key: "month" },
      ...(kpiData.contractCompliance[0]
        ? Object.keys(kpiData.contractCompliance[0])
          .filter((key) => key !== "month")
          .map((key) => ({ label: key, key }))
        : []),
    ];
    sections.push(convertToCSV(kpiData.contractCompliance, headers));
    sections.push("");
  }

  // Section 8: Demandes de congé
  if (kpiData.requests && kpiData.requests.length > 0) {
    sections.push("DEMANDES DE CONGÉ");
    sections.push(
      convertToCSV(kpiData.requests, [
        { label: "Membre", key: "member" },
        { label: "Type", key: "type" },
        { label: "Date début", key: "startDate" },
        { label: "Date fin", key: "endDate" },
        { label: "Statut", key: "status" },
        { label: "Raison", key: "reason" },
      ])
    );
    sections.push("");
  }

  const dateRange = formatDateRange(startDate, endDate);
  const safeTeamName = (teamName || "Equipe").replace(/[^a-zA-Z0-9]/g, "_");

  // Préparer les données structurées pour l'export
  const exportData = {
    metadata: {
      type: "Manager",
      teamName,
      startDate,
      endDate,
      exportDate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    },
    sections: {
      generalStats: {
        teamAttendance: kpiData.teamAttendance?.rate || 0,
        averageHours: calculateAverageHours(kpiData.hoursWorked).replace(
          "h",
          ""
        ),
        warnings:
          kpiData.warnings?.reduce((acc, curr) => acc + curr.count, 0) || 0,
        members: kpiData.attendance?.length || 0,
      },
      attendance: kpiData.attendance || [],
      hoursWorked: kpiData.hoursWorked || [],
      warnings: kpiData.warnings || [],
      pauseTime: kpiData.pauseTime || [],
      leaveDays: kpiData.leaveDays || [],
      contractCompliance: kpiData.contractCompliance || [],
      requests: kpiData.requests || [],
    },
  };

  // Exporter selon le format
  if (format === EXPORT_FORMATS.JSON) {
    const filename = `KPI_Manager_${safeTeamName}_${dateRange}.json`;
    downloadJSON(exportData, filename);
  } else if (format === EXPORT_FORMATS.PDF) {
    try {
      const pdf = new jsPDF();
      let yPosition = PDF_CONFIG.INITIAL_Y_POSITION;

      // Titre
      pdf.setFontSize(PDF_CONFIG.TITLE_FONT_SIZE);
      pdf.text(`KPI Manager - ${teamName}`, 14, yPosition);
      yPosition += PDF_CONFIG.SPACING.AFTER_TITLE;
      pdf.setFontSize(PDF_CONFIG.SUBTITLE_FONT_SIZE);
      pdf.text(`Période: ${dateRange.replace(/_/g, " au ")}`, 14, yPosition);
      yPosition += PDF_CONFIG.SPACING.AFTER_SUBTITLE;

      // Statistiques générales
      pdf.setFontSize(PDF_CONFIG.SECTION_FONT_SIZE);
      pdf.text("Statistiques Générales", 14, yPosition);
      yPosition += PDF_CONFIG.SPACING.AFTER_SECTION;
      const generalStatsData = [
        ["Métrique", "Valeur"],
        ["Présence Équipe", `${kpiData.teamAttendance?.rate || 0}%`],
        ["Heures Moyennes", calculateAverageHours(kpiData.hoursWorked)],
        [
          "Avertissements",
          kpiData.warnings?.reduce((acc, curr) => acc + curr.count, 0) || 0,
        ],
        ["Membres", kpiData.attendance?.length || 0],
      ];
      autoTable(pdf, {
        startY: yPosition,
        head: [generalStatsData[0]],
        body: generalStatsData.slice(1),
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] },
      });
      yPosition = getFinalY(pdf, yPosition, 15) + 15;

      // Présence par membre
      if (kpiData.attendance && kpiData.attendance.length > 0) {
        yPosition = checkAndAddPage(pdf, yPosition);
        pdf.setFontSize(PDF_CONFIG.SECTION_FONT_SIZE);
        pdf.text("Taux de Présence par Membre", 14, yPosition);
        yPosition += PDF_CONFIG.SPACING.AFTER_SECTION;
        const tableData1 = arrayToTableData(kpiData.attendance, [
          { label: "Membre", key: "name" },
          { label: "Taux (%)", key: "rate" },
        ]);
        autoTable(pdf, {
          startY: yPosition,
          head: tableData1.head,
          body: tableData1.body,
          theme: "striped",
          headStyles: { fillColor: PDF_CONFIG.HEADER_COLOR },
        });
        yPosition =
          getFinalY(pdf, yPosition, PDF_CONFIG.SPACING.AFTER_TABLE) +
          PDF_CONFIG.SPACING.AFTER_TABLE;
      }

      // Heures travaillées
      if (kpiData.hoursWorked && kpiData.hoursWorked.length > 0) {
        yPosition = checkAndAddPage(pdf, yPosition);
        pdf.setFontSize(PDF_CONFIG.SECTION_FONT_SIZE);
        pdf.text("Heures Travaillées par Membre", 14, yPosition);
        yPosition += PDF_CONFIG.SPACING.AFTER_SECTION;
        const tableData2 = arrayToTableData(kpiData.hoursWorked, [
          { label: "Membre", key: "member" },
          { label: "Heures", key: "hours" },
        ]);
        autoTable(pdf, {
          startY: yPosition,
          head: tableData2.head,
          body: tableData2.body,
          theme: "striped",
          headStyles: { fillColor: PDF_CONFIG.HEADER_COLOR },
        });
        yPosition =
          getFinalY(pdf, yPosition, PDF_CONFIG.SPACING.AFTER_TABLE) +
          PDF_CONFIG.SPACING.AFTER_TABLE;
      }

      // Avertissements
      if (kpiData.warnings && kpiData.warnings.length > 0) {
        yPosition = checkAndAddPage(pdf, yPosition);
        pdf.setFontSize(PDF_CONFIG.SECTION_FONT_SIZE);
        pdf.text("Avertissements par Membre", 14, yPosition);
        yPosition += PDF_CONFIG.SPACING.AFTER_SECTION;
        const tableData3 = arrayToTableData(kpiData.warnings, [
          { label: "Membre", key: "member" },
          { label: "Nombre", key: "count" },
        ]);
        autoTable(pdf, {
          startY: yPosition,
          head: tableData3.head,
          body: tableData3.body,
          theme: "striped",
          headStyles: { fillColor: PDF_CONFIG.HEADER_COLOR },
        });
        yPosition =
          getFinalY(pdf, yPosition, PDF_CONFIG.SPACING.AFTER_TABLE) +
          PDF_CONFIG.SPACING.AFTER_TABLE;
      }

      // Temps de pause
      if (kpiData.pauseTime && kpiData.pauseTime.length > 0) {
        yPosition = checkAndAddPage(pdf, yPosition);
        pdf.setFontSize(PDF_CONFIG.SECTION_FONT_SIZE);
        pdf.text("Temps de Pause Moyen par Membre", 14, yPosition);
        yPosition += PDF_CONFIG.SPACING.AFTER_SECTION;
        const tableData4 = arrayToTableData(kpiData.pauseTime, [
          { label: "Membre", key: "member" },
          { label: "Minutes", key: "minutes" },
        ]);
        autoTable(pdf, {
          startY: yPosition,
          head: tableData4.head,
          body: tableData4.body,
          theme: "striped",
          headStyles: { fillColor: PDF_CONFIG.HEADER_COLOR },
        });
        yPosition =
          getFinalY(pdf, yPosition, PDF_CONFIG.SPACING.AFTER_TABLE) +
          PDF_CONFIG.SPACING.AFTER_TABLE;
      }

      // Jours de congé
      if (kpiData.leaveDays && kpiData.leaveDays.length > 0) {
        yPosition = checkAndAddPage(pdf, yPosition);
        pdf.setFontSize(PDF_CONFIG.SECTION_FONT_SIZE);
        pdf.text("Jours de Congé par Membre", 14, yPosition);
        yPosition += PDF_CONFIG.SPACING.AFTER_SECTION;
        const tableData5 = arrayToTableData(kpiData.leaveDays, [
          { label: "Membre", key: "member" },
          { label: "Jours", key: "days" },
        ]);
        autoTable(pdf, {
          startY: yPosition,
          head: tableData5.head,
          body: tableData5.body,
          theme: "striped",
          headStyles: { fillColor: PDF_CONFIG.HEADER_COLOR },
        });
        yPosition =
          getFinalY(pdf, yPosition, PDF_CONFIG.SPACING.AFTER_TABLE) +
          PDF_CONFIG.SPACING.AFTER_TABLE;
      }

      // Conformité au contrat
      if (kpiData.contractCompliance && kpiData.contractCompliance.length > 0) {
        yPosition = checkAndAddPage(pdf, yPosition);
        pdf.setFontSize(PDF_CONFIG.SECTION_FONT_SIZE);
        pdf.text("Conformité au Contrat (% des heures)", 14, yPosition);
        yPosition += PDF_CONFIG.SPACING.AFTER_SECTION;
        const headers = [
          { label: "Mois", key: "month" },
          ...(kpiData.contractCompliance[0]
            ? Object.keys(kpiData.contractCompliance[0])
              .filter((key) => key !== "month")
              .map((key) => ({ label: key, key }))
            : []),
        ];
        const tableData6 = arrayToTableData(
          kpiData.contractCompliance,
          headers
        );
        autoTable(pdf, {
          startY: yPosition,
          head: tableData6.head,
          body: tableData6.body,
          theme: "striped",
          headStyles: { fillColor: PDF_CONFIG.HEADER_COLOR },
        });
        yPosition =
          getFinalY(pdf, yPosition, PDF_CONFIG.SPACING.AFTER_TABLE) +
          PDF_CONFIG.SPACING.AFTER_TABLE;
      }

      // Demandes de congé
      if (kpiData.requests && kpiData.requests.length > 0) {
        yPosition = checkAndAddPage(pdf, yPosition);
        pdf.setFontSize(PDF_CONFIG.SECTION_FONT_SIZE);
        pdf.text("Demandes de Congé", 14, yPosition);
        yPosition += PDF_CONFIG.SPACING.AFTER_SECTION;
        const tableData7 = arrayToTableData(kpiData.requests, [
          { label: "Membre", key: "member" },
          { label: "Type", key: "type" },
          { label: "Date début", key: "startDate" },
          { label: "Date fin", key: "endDate" },
          { label: "Statut", key: "status" },
          { label: "Raison", key: "reason" },
        ]);
        autoTable(pdf, {
          startY: yPosition,
          head: tableData7.head,
          body: tableData7.body,
          theme: "striped",
          headStyles: { fillColor: PDF_CONFIG.HEADER_COLOR },
          columnStyles: {
            5: { cellWidth: 60 },
          },
        });
      }

      const filename = `KPI_Manager_${safeTeamName}_${dateRange}.pdf`;
      downloadPDF(pdf, filename);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF Manager:", error);
      throw new Error(`Erreur lors de l'export PDF: ${error.message}`);
    }
  } else {
    // Export CSV
    const csvContent = sections.join("\n");
    const filename = `KPI_Manager_${safeTeamName}_${dateRange}.csv`;
    downloadCSV(csvContent, filename);
  }
}

/**
 * Exporte les KPI Utilisateur
 */
export function exportUserKPIs(
  kpiData,
  startDate,
  endDate,
  format = EXPORT_FORMATS.CSV
) {
  const sections = [];

  // Calculer la présence moyenne une seule fois
  const userAvgPresence = calculateAverage(
    kpiData.personalAttendance || [],
    "rate"
  );

  // Section 1: Statistiques générales
  sections.push("STATISTIQUES GÉNÉRALES");
  sections.push(
    convertToCSV(
      [
        { label: "Métrique", value: "Valeur" },
        { label: "Présence moyenne", value: `${userAvgPresence}%` },
        {
          label: "Conformité au contrat",
          value: `${kpiData.contractRate?.rate || 0}%`,
        },
        {
          label: "Pause moyenne",
          value: `${kpiData.pauseAverage?.minutes || 0}min`,
        },
        {
          label: "Jours de congé",
          value: `${kpiData.leaveDays?.average || 0}j`,
        },
      ],
      [
        { label: "Métrique", key: "label" },
        { label: "Valeur", key: "value" },
      ]
    )
  );
  sections.push("");

  // Section 2: Présence personnelle
  if (kpiData.personalAttendance && kpiData.personalAttendance.length > 0) {
    sections.push("TAUX DE PRÉSENCE PERSONNEL");
    sections.push(
      convertToCSV(kpiData.personalAttendance, [
        { label: "Mois", key: "month" },
        { label: "Taux (%)", key: "rate" },
      ])
    );
    sections.push("");
  }

  // Section 3: Heures mensuelles
  if (kpiData.monthlyHours && kpiData.monthlyHours.length > 0) {
    sections.push("HEURES TRAVAILLÉES MENSUELLES");
    sections.push(
      convertToCSV(kpiData.monthlyHours, [
        { label: "Mois", key: "month" },
        { label: "Heures", key: "hours" },
      ])
    );
    sections.push("");
  }

  // Section 4: Heures d'arrivée et départ
  if (kpiData.arrivalDeparture && kpiData.arrivalDeparture.length > 0) {
    sections.push("HEURES D'ARRIVÉE ET DÉPART");
    sections.push(
      convertToCSV(formatArrivalDeparture(kpiData.arrivalDeparture), [
        { label: "Jour", key: "day" },
        { label: "Arrivée", key: "arrival" },
        { label: "Départ", key: "departure" },
      ])
    );
    sections.push("");
  }

  // Section 5: Avertissements par type
  if (kpiData.warningsByType && kpiData.warningsByType.length > 0) {
    sections.push("AVERTISSEMENTS PAR TYPE");
    sections.push(
      convertToCSV(kpiData.warningsByType, [
        { label: "Type", key: "type" },
        { label: "Nombre", key: "count" },
      ])
    );
    sections.push("");
  }

  const dateRange = formatDateRange(startDate, endDate);

  // Préparer les données structurées pour l'export
  const exportData = {
    metadata: {
      type: "Utilisateur",
      startDate,
      endDate,
      exportDate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    },
    sections: {
      generalStats: {
        averagePresence: `${userAvgPresence}%`,
        contractCompliance: `${kpiData.contractRate?.rate || 0}%`,
        averagePause: `${kpiData.pauseAverage?.minutes || 0}min`,
        leaveDays: `${kpiData.leaveDays?.average || 0}j`,
      },
      personalAttendance: kpiData.personalAttendance || [],
      monthlyHours: kpiData.monthlyHours || [],
      arrivalDeparture: kpiData.arrivalDeparture || [],
      warningsByType: kpiData.warningsByType || [],
    },
  };

  // Exporter selon le format
  if (format === EXPORT_FORMATS.JSON) {
    const filename = `KPI_Utilisateur_${dateRange}.json`;
    downloadJSON(exportData, filename);
  } else if (format === EXPORT_FORMATS.PDF) {
    try {
      const pdf = new jsPDF();
      let yPosition = PDF_CONFIG.INITIAL_Y_POSITION;

      // Titre
      pdf.setFontSize(PDF_CONFIG.TITLE_FONT_SIZE);
      pdf.text("KPI Utilisateur", 14, yPosition);
      yPosition += PDF_CONFIG.SPACING.AFTER_TITLE;
      pdf.setFontSize(PDF_CONFIG.SUBTITLE_FONT_SIZE);
      pdf.text(`Période: ${dateRange.replace(/_/g, " au ")}`, 14, yPosition);
      yPosition += PDF_CONFIG.SPACING.AFTER_SUBTITLE;

      // Statistiques générales
      pdf.setFontSize(14);
      pdf.text("Statistiques Générales", 14, yPosition);
      yPosition += 8;
      const generalStatsData = [
        ["Métrique", "Valeur"],
        ["Présence moyenne", `${userAvgPresence}%`],
        ["Conformité au contrat", `${kpiData.contractRate?.rate || 0}%`],
        ["Pause moyenne", `${kpiData.pauseAverage?.minutes || 0}min`],
        ["Jours de congé", `${kpiData.leaveDays?.average || 0}j`],
      ];
      autoTable(pdf, {
        startY: yPosition,
        head: [generalStatsData[0]],
        body: generalStatsData.slice(1),
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] },
      });
      yPosition = getFinalY(pdf, yPosition, 15) + 15;

      // Présence personnelle
      if (kpiData.personalAttendance && kpiData.personalAttendance.length > 0) {
        yPosition = checkAndAddPage(pdf, yPosition);
        pdf.setFontSize(PDF_CONFIG.SECTION_FONT_SIZE);
        pdf.text("Taux de Présence Personnel", 14, yPosition);
        yPosition += PDF_CONFIG.SPACING.AFTER_SECTION;
        const tableData1 = arrayToTableData(kpiData.personalAttendance, [
          { label: "Mois", key: "month" },
          { label: "Taux (%)", key: "rate" },
        ]);
        autoTable(pdf, {
          startY: yPosition,
          head: tableData1.head,
          body: tableData1.body,
          theme: "striped",
          headStyles: { fillColor: PDF_CONFIG.HEADER_COLOR },
        });
        yPosition =
          getFinalY(pdf, yPosition, PDF_CONFIG.SPACING.AFTER_TABLE) +
          PDF_CONFIG.SPACING.AFTER_TABLE;
      }

      // Heures mensuelles
      if (kpiData.monthlyHours && kpiData.monthlyHours.length > 0) {
        yPosition = checkAndAddPage(pdf, yPosition);
        pdf.setFontSize(PDF_CONFIG.SECTION_FONT_SIZE);
        pdf.text("Heures Travaillées Mensuelles", 14, yPosition);
        yPosition += PDF_CONFIG.SPACING.AFTER_SECTION;
        const tableData2 = arrayToTableData(kpiData.monthlyHours, [
          { label: "Mois", key: "month" },
          { label: "Heures", key: "hours" },
        ]);
        autoTable(pdf, {
          startY: yPosition,
          head: tableData2.head,
          body: tableData2.body,
          theme: "striped",
          headStyles: { fillColor: PDF_CONFIG.HEADER_COLOR },
        });
        yPosition =
          getFinalY(pdf, yPosition, PDF_CONFIG.SPACING.AFTER_TABLE) +
          PDF_CONFIG.SPACING.AFTER_TABLE;
      }

      // Heures d'arrivée et départ
      if (kpiData.arrivalDeparture && kpiData.arrivalDeparture.length > 0) {
        yPosition = checkAndAddPage(pdf, yPosition);
        pdf.setFontSize(PDF_CONFIG.SECTION_FONT_SIZE);
        pdf.text("Heures d'Arrivée et Départ", 14, yPosition);
        yPosition += PDF_CONFIG.SPACING.AFTER_SECTION;
        const tableData3 = arrayToTableData(
          formatArrivalDeparture(kpiData.arrivalDeparture),
          [
            { label: "Jour", key: "day" },
            { label: "Arrivée", key: "arrival" },
            { label: "Départ", key: "departure" },
          ]
        );
        autoTable(pdf, {
          startY: yPosition,
          head: tableData3.head,
          body: tableData3.body,
          theme: "striped",
          headStyles: { fillColor: PDF_CONFIG.HEADER_COLOR },
        });
        yPosition =
          getFinalY(pdf, yPosition, PDF_CONFIG.SPACING.AFTER_TABLE) +
          PDF_CONFIG.SPACING.AFTER_TABLE;
      }

      // Avertissements par type
      if (kpiData.warningsByType && kpiData.warningsByType.length > 0) {
        yPosition = checkAndAddPage(pdf, yPosition);
        pdf.setFontSize(PDF_CONFIG.SECTION_FONT_SIZE);
        pdf.text("Avertissements par Type", 14, yPosition);
        yPosition += PDF_CONFIG.SPACING.AFTER_SECTION;
        const tableData4 = arrayToTableData(kpiData.warningsByType, [
          { label: "Type", key: "type" },
          { label: "Nombre", key: "count" },
        ]);
        autoTable(pdf, {
          startY: yPosition,
          head: tableData4.head,
          body: tableData4.body,
          theme: "striped",
          headStyles: { fillColor: PDF_CONFIG.HEADER_COLOR },
        });
      }

      const filename = `KPI_Utilisateur_${dateRange}.pdf`;
      downloadPDF(pdf, filename);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF Utilisateur:", error);
      throw new Error(`Erreur lors de l'export PDF: ${error.message}`);
    }
  } else {
    // Export CSV
    const csvContent = sections.join("\n");
    const filename = `KPI_Utilisateur_${dateRange}.csv`;
    downloadCSV(csvContent, filename);
  }
}
