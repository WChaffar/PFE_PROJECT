import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

// Helper function pour obtenir le nom complet
const getMemberName = (memberObject) => {
  if (!memberObject) return 'Non assigné';
  
  // Utiliser uniquement fullName
  if (memberObject.fullName && typeof memberObject.fullName === 'string' && memberObject.fullName.trim() !== '') {
    return memberObject.fullName.trim();
  }
  
  return 'Membre d\'équipe';
};

// Générer un rapport PDF simple sans autoTable
export const generatePDFReport = (reportData, filename) => {
  const doc = new jsPDF();
  let yPosition = 20;

  // Helper function pour ajouter du texte avec gestion automatique des pages
  const addText = (text, x = 20, fontSize = 12, style = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', style);
    
    // Calculer l'espacement nécessaire selon la taille de police
    const lineSpacing = Math.max(fontSize * 0.3, 4);
    
    // Vérifier si on a assez d'espace pour cette ligne de texte
    if (yPosition + fontSize + lineSpacing > 280) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Diviser le texte si trop long
    const maxWidth = 170;
    const textLines = doc.splitTextToSize(text, maxWidth);
    
    if (Array.isArray(textLines)) {
      textLines.forEach((line, index) => {
        // Vérifier l'espace pour chaque ligne
        if (yPosition + fontSize + lineSpacing > 280) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, x, yPosition);
        yPosition += fontSize + lineSpacing;
      });
    } else {
      doc.text(textLines, x, yPosition);
      yPosition += fontSize + lineSpacing;
    }
    
    return yPosition;
  };

  // Helper function pour ajouter des tableaux simples
  const addSimpleTable = (headers, data, title = null) => {
    // Calculer l'espace nécessaire pour le tableau
    const tableHeight = (data.length + 1) * 10 + (title ? 25 : 10); // headers + données + titre
    
    // Vérifier si on a assez d'espace sur la page actuelle
    if (yPosition + tableHeight > 270) {
      doc.addPage();
      yPosition = 20;
    }

    if (title) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 20, yPosition);
      yPosition += 20;
    }

    // Dessiner les headers avec largeurs adaptatives
    const rowHeight = 12; // Hauteur un peu plus grande
    let colWidths;
    
    // Définir des largeurs adaptatives selon le nombre de colonnes
    if (headers.length === 2) {
      colWidths = [85, 85]; // Deux colonnes égales
    } else if (headers.length === 5) {
      colWidths = [50, 35, 25, 25, 25]; // Nom plus large, autres plus petites
    } else if (headers.length === 4) {
      colWidths = [50, 35, 40, 35]; // Distribution équilibrée
    } else {
      // Défaut : largeur égale
      const defaultWidth = 170 / headers.length;
      colWidths = new Array(headers.length).fill(defaultWidth);
    }
    
    doc.setFillColor(66, 139, 202);
    doc.rect(20, yPosition - 7, 170, rowHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9); // Police plus petite pour les headers
    doc.setFont('helvetica', 'bold');
    
    let currentX = 22;
    headers.forEach((header, index) => {
      const text = String(header).substring(0, Math.floor(colWidths[index] / 3));
      doc.text(text, currentX, yPosition);
      currentX += colWidths[index];
    });
    
    yPosition += rowHeight;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    // Dessiner les données
    data.forEach((row, rowIndex) => {
      // Vérification de l'espace pour chaque ligne
      if (yPosition + rowHeight > 280) {
        doc.addPage();
        yPosition = 20;
        
        // Redessiner les headers sur la nouvelle page
        doc.setFillColor(66, 139, 202);
        doc.rect(20, yPosition - 7, 170, rowHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        
        let currentX = 22;
        headers.forEach((header, index) => {
          const text = String(header).substring(0, Math.floor(colWidths[index] / 3));
          doc.text(text, currentX, yPosition);
          currentX += colWidths[index];
        });
        
        yPosition += rowHeight;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
      }

      // Alterner les couleurs de fond
      if (rowIndex % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, yPosition - 7, 170, rowHeight - 2, 'F');
      }

      let currentX = 22;
      row.forEach((cell, cellIndex) => {
        const maxChars = Math.floor(colWidths[cellIndex] / 2.5); // Calcul adaptatif
        const cellText = String(cell || '').substring(0, maxChars);
        doc.text(cellText, currentX, yPosition);
        currentX += colWidths[cellIndex];
      });
      
      yPosition += rowHeight;
    });
    
    // Ajouter un espacement après le tableau
    yPosition += 15;
  };

  if (reportData.projects) {
    // Rapport en lot
    addText('RAPPORT GLOBAL DES PROJETS', 20, 18, 'bold');
    addText(`Généré le: ${new Date(reportData.generatedAt).toLocaleString()}`, 20, 10);
    addText(`Par: ${reportData.user?.name}`, 20, 10);
    yPosition += 10;

    // Résumé général
    addText('RÉSUMÉ EXÉCUTIF', 20, 16, 'bold');
    addText(`Nombre total de projets: ${reportData.summary?.totalProjects}`, 25);
    addText(`Budget total: ${reportData.summary?.totalBudget} jours`, 25);
    yPosition += 15;

    // KPIs globaux
    addText('INDICATEURS CLÉS DE PERFORMANCE (KPIs)', 20, 14, 'bold');
    
    // Tableau des KPIs
    const kpiData = [
      ['Projets actifs', `${reportData.summary?.projectsByStatus?.['In Progress'] || 0}`],
      ['Projets terminés', `${reportData.summary?.projectsByStatus?.['Completed'] || 0}`],
      ['Projets non démarrés', `${reportData.summary?.projectsByStatus?.['Not Started'] || 0}`],
      ['Projets externes', `${reportData.summary?.projectsByType?.external || 0}`],
      ['Projets internes', `${reportData.summary?.projectsByType?.internal || 0}`],
      ['Taux de completion', `${Math.round(((reportData.summary?.projectsByStatus?.['Completed'] || 0) / (reportData.summary?.totalProjects || 1)) * 100)}%`]
    ];
    
    addSimpleTable(['Métrique', 'Valeur'], kpiData, 'KPIs Généraux');

    // Tableau détaillé des projets - Version réduite pour éviter le chevauchement
    const projectTableData = reportData.projects.map(project => [
      project.name.substring(0, 25),
      project.client.substring(0, 18),
      project.status.substring(0, 12),
      `${project.budget} j`,
      `${project.progress}%`
    ]);

    addSimpleTable(
      ['Nom du Projet', 'Client', 'Statut', 'Budget', 'Progression'],
      projectTableData,
      'Détail des Projets'
    );

    // Si il y a beaucoup de projets, créer des tableaux séparés pour les détails
    if (reportData.projects.length > 0) {
      // Tableau des types et équipes - Utilisation correcte des données
      const projectDetailsData = reportData.projects.map(project => [
        project.name.substring(0, 30),
        project.type.substring(0, 15),
        `${project.tasks || 0} tâches`,
        `${project.assignments || 0} membres`
      ]);

      addSimpleTable(
        ['Nom du Projet', 'Type', 'Nb Tâches', 'Nb Équipe'],
        projectDetailsData,
        'Détails Techniques des Projets'
      );
    }

  } else {
    // Rapport individuel
    const project = reportData.project;
    
    addText(`RAPPORT DE PROJET: ${project.name}`, 20, 18, 'bold');
    addText(`Généré le: ${new Date(reportData.generatedAt).toLocaleString()}`, 20, 10);
    yPosition += 10;

    // Informations générales
    addText('INFORMATIONS GÉNÉRALES', 20, 16, 'bold');
    addText(`Nom du projet: ${project.name}`, 25);
    addText(`Client: ${project.client}`, 25);
    addText(`Description: ${project.description}`, 25);
    addText(`Type: ${project.type}`, 25);
    addText(`Catégorie: ${project.category}`, 25);
    addText(`Priorité: ${project.priority}`, 25);
    addText(`Budget: ${project.budget} jours`, 25);
    addText(`Financement additionnel: ${project.additionalFunding} jours`, 25);
    addText(`Statut: ${reportData.status}`, 25);
    addText(`Progression: ${reportData.progress}%`, 25);
    yPosition += 20;

    // KPIs du projet
    addText('INDICATEURS DE PERFORMANCE', 20, 16, 'bold');
    
    const projectKPIs = [
      ['Tâches totales', reportData.stats?.totalTasks?.toString() || '0'],
      ['Tâches terminées', reportData.stats?.completedTasks?.toString() || '0'],
      ['Taux completion tâches', `${Math.round((reportData.stats?.completedTasks || 0) / (reportData.stats?.totalTasks || 1) * 100)}%`],
      ['Affectations totales', reportData.stats?.totalAssignments?.toString() || '0'],
      ['Affectations actives', reportData.stats?.activeAssignments?.toString() || '0'],
      ['Durée prévue', `${Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24))} jours`]
    ];

    addSimpleTable(['Métrique', 'Valeur'], projectKPIs, 'KPIs du Projet');

    // Tâches détaillées
    if (reportData.tasks && reportData.tasks.length > 0) {
      const taskData = reportData.tasks.slice(0, 10).map(task => [ // Limiter à 10 tâches pour l'espace
        task.title.substring(0, 25),
        task.status.substring(0, 12),
        task.projectPhase?.substring(0, 10) || 'N/A',
        `${task.budget || 0} j`
      ]);

      addSimpleTable(
        ['Tâche', 'Statut', 'Phase', 'Budget'],
        taskData,
        'TÂCHES DU PROJET (Top 10)'
      );
    }

    // Équipe du projet
    if (reportData.assignments && reportData.assignments.length > 0) {
      const teamData = reportData.assignments.slice(0, 10).map(assignment => {
        // Récupérer le nom complet de l'employé uniquement via fullName
        let memberName = 'Non assigné';
        
        // Priorité 1: l'objet employee (la personne assignée à la tâche)
        if (assignment.employee && typeof assignment.employee === 'object') {
          memberName = getMemberName(assignment.employee);
        }
        // Priorité 2: assignedTo si disponible
        else if (assignment.assignedTo && typeof assignment.assignedTo === 'object') {
          memberName = getMemberName(assignment.assignedTo);
        }
        // Si employee n'est pas populé (ID seulement)
        else if (assignment.employee && typeof assignment.employee === 'string') {
          memberName = `Employé ID: ${assignment.employee.substring(0, 8)}...`;
        }
        
        const status = assignment.status?.substring(0, 12) || 'assigned';
        const normalizedStatus = (status === 'canceled' || status === 'cancelled') ? 'not assigned' : status;
        
        return [
          memberName.substring(0, 25) || 'N/A',
          assignment.role?.substring(0, 15) || 'Member',
          normalizedStatus
        ];
      });

      addSimpleTable(
        ['Membre équipe', 'Rôle', 'Statut'],
        teamData,
        'ÉQUIPE DU PROJET'
      );
    }
  }

  doc.save(`${filename}.pdf`);
};

// Générer un rapport Excel complet
export const generateExcelReport = (reportData, filename) => {
  const workbook = XLSX.utils.book_new();

  if (reportData.projects) {
    // Rapport en lot - Feuille résumé
    const summaryData = [
      ['RAPPORT GLOBAL DES PROJETS'],
      [''],
      ['Généré le', new Date(reportData.generatedAt).toLocaleString()],
      ['Par', reportData.user?.name],
      [''],
      ['RÉSUMÉ EXÉCUTIF'],
      ['Nombre total de projets', reportData.summary?.totalProjects],
      ['Budget total (jours)', reportData.summary?.totalBudget],
      [''],
      ['KPIs GLOBAUX'],
      ['Projets actifs', reportData.summary?.projectsByStatus?.['In Progress'] || 0],
      ['Projets terminés', reportData.summary?.projectsByStatus?.['Completed'] || 0],
      ['Projets non démarrés', reportData.summary?.projectsByStatus?.['Not Started'] || 0],
      ['Projets externes', reportData.summary?.projectsByType?.external || 0],
      ['Projets internes', reportData.summary?.projectsByType?.internal || 0],
      ['Taux de completion (%)', Math.round(((reportData.summary?.projectsByStatus?.['Completed'] || 0) / (reportData.summary?.totalProjects || 1)) * 100)]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé');

    // Feuille détails des projets
    const projectsData = [
      ['Nom du Projet', 'Client', 'Type', 'Catégorie', 'Priorité', 'Budget (jours)', 'Statut', 'Progression (%)', 'Date début', 'Date fin', 'Tâches', 'Affectations'],
      ...reportData.projects.map(project => [
        project.name,
        project.client,
        project.type,
        project.category,
        project.priority,
        project.budget,
        project.status,
        project.progress,
        new Date(project.startDate).toLocaleDateString(),
        new Date(project.endDate).toLocaleDateString(),
        project.tasks,
        project.assignments
      ])
    ];

    const projectsSheet = XLSX.utils.aoa_to_sheet(projectsData);
    XLSX.utils.book_append_sheet(workbook, projectsSheet, 'Projets');

  } else {
    // Rapport individuel
    const project = reportData.project;
    
    // Feuille informations générales
    const projectInfoData = [
      [`RAPPORT DE PROJET: ${project.name}`],
      [''],
      ['Généré le', new Date(reportData.generatedAt).toLocaleString()],
      [''],
      ['INFORMATIONS GÉNÉRALES'],
      ['Nom du projet', project.name],
      ['Client', project.client],
      ['Description', project.description],
      ['Type', project.type],
      ['Catégorie', project.category],
      ['Priorité', project.priority],
      ['Budget (jours)', project.budget],
      ['Financement additionnel (jours)', project.additionalFunding],
      ['Statut', reportData.status],
      ['Progression (%)', reportData.progress],
      ['Date de début', new Date(project.startDate).toLocaleDateString()],
      ['Date de fin', new Date(project.endDate).toLocaleDateString()],
      ['Date de livraison', new Date(project.deliveryDate).toLocaleDateString()],
      [''],
      ['KPIs DU PROJET'],
      ['Tâches totales', reportData.stats.totalTasks],
      ['Tâches terminées', reportData.stats.completedTasks],
      ['Taux de completion des tâches (%)', Math.round((reportData.stats.completedTasks / (reportData.stats.totalTasks || 1)) * 100)],
      ['Affectations totales', reportData.stats.totalAssignments],
      ['Affectations actives', reportData.stats.activeAssignments],
      ['Durée prévue (jours)', Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24))],
      ['Temps écoulé (jours)', Math.ceil((new Date() - new Date(project.startDate)) / (1000 * 60 * 60 * 24))]
    ];

    const infoSheet = XLSX.utils.aoa_to_sheet(projectInfoData);
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Informations');

    // Feuille tâches
    if (reportData.tasks && reportData.tasks.length > 0) {
      const tasksData = [
        ['Tâche', 'Description', 'Statut', 'Priorité', 'Assigné à', 'Date début', 'Date fin'],
        ...reportData.tasks.map(task => [
          task.title,
          task.description,
          task.status,
          task.priority,
          getMemberName(task.assignedTo),
          new Date(task.startDate).toLocaleDateString(),
          new Date(task.endDate).toLocaleDateString()
        ])
      ];

      const tasksSheet = XLSX.utils.aoa_to_sheet(tasksData);
      XLSX.utils.book_append_sheet(workbook, tasksSheet, 'Tâches');
    }

    // Feuille équipe
    if (reportData.assignments && reportData.assignments.length > 0) {
      const teamData = [
        ['Membre équipe', 'Rôle', 'Statut'],
        ...reportData.assignments.map(assignment => {
          // Récupérer le nom complet de l'employé uniquement via fullName
          let memberName = 'Non assigné';
          
          // Priorité 1: l'objet employee (la personne assignée à la tâche)
          if (assignment.employee && typeof assignment.employee === 'object') {
            memberName = getMemberName(assignment.employee);
          }
          // Priorité 2: assignedTo si disponible
          else if (assignment.assignedTo && typeof assignment.assignedTo === 'object') {
            memberName = getMemberName(assignment.assignedTo);
          }
          // Si employee n'est pas populé (ID seulement)
          else if (assignment.employee && typeof assignment.employee === 'string') {
            memberName = `Employé ID: ${assignment.employee.substring(0, 8)}...`;
          }
          
          const status = assignment.status || 'N/A';
          const normalizedStatus = (status === 'canceled' || status === 'cancelled') ? 'not assigned' : status;
          
          return [
            memberName || 'N/A',
            assignment.role || 'N/A',
            normalizedStatus
          ];
        })
      ];

      const teamSheet = XLSX.utils.aoa_to_sheet(teamData);
      XLSX.utils.book_append_sheet(workbook, teamSheet, 'Équipe');
    }
  }

  // Sauvegarder le fichier
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Générer un rapport Word complet
export const generateWordReport = async (reportData, filename) => {
  let sections = [];

  if (reportData.projects) {
    // Rapport en lot
    sections.push(
      new Paragraph({
        text: 'RAPPORT GLOBAL DES PROJETS',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Généré le: ${new Date(reportData.generatedAt).toLocaleString()}`,
        alignment: AlignmentType.RIGHT,
      }),
      new Paragraph({
        text: `Par: ${reportData.user?.name}`,
        alignment: AlignmentType.RIGHT,
      }),
      new Paragraph({ text: '' }),
      
      new Paragraph({
        text: 'RÉSUMÉ EXÉCUTIF',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: `Nombre total de projets: ${reportData.summary?.totalProjects}`,
      }),
      new Paragraph({
        text: `Budget total: ${reportData.summary?.totalBudget} jours`,
      }),
      new Paragraph({ text: '' }),
      
      new Paragraph({
        text: 'INDICATEURS CLÉS DE PERFORMANCE (KPIs)',
        heading: HeadingLevel.HEADING_2,
      })
    );

    // Table KPIs
    const kpiTable = new Table({
      columnWidths: [3000, 2000],
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Métrique' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Valeur' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Projets actifs' })] }),
            new TableCell({ children: [new Paragraph({ text: `${reportData.summary?.projectsByStatus?.['In Progress'] || 0}` })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Projets terminés' })] }),
            new TableCell({ children: [new Paragraph({ text: `${reportData.summary?.projectsByStatus?.['Completed'] || 0}` })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Taux de completion' })] }),
            new TableCell({ children: [new Paragraph({ text: `${Math.round(((reportData.summary?.projectsByStatus?.['Completed'] || 0) / (reportData.summary?.totalProjects || 1)) * 100)}%` })] }),
          ],
        }),
      ],
    });

    sections.push(kpiTable);

  } else {
    // Rapport individuel
    const project = reportData.project;
    
    sections.push(
      new Paragraph({
        text: `RAPPORT DE PROJET: ${project.name}`,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Généré le: ${new Date(reportData.generatedAt).toLocaleString()}`,
        alignment: AlignmentType.RIGHT,
      }),
      new Paragraph({ text: '' }),
      
      new Paragraph({
        text: 'INFORMATIONS GÉNÉRALES',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({ text: `Nom du projet: ${project.name}` }),
      new Paragraph({ text: `Client: ${project.client}` }),
      new Paragraph({ text: `Description: ${project.description}` }),
      new Paragraph({ text: `Type: ${project.type}` }),
      new Paragraph({ text: `Catégorie: ${project.category}` }),
      new Paragraph({ text: `Priorité: ${project.priority}` }),
      new Paragraph({ text: `Budget: ${project.budget} jours` }),
      new Paragraph({ text: `Statut: ${reportData.status}` }),
      new Paragraph({ text: `Progression: ${reportData.progress}%` }),
      new Paragraph({ text: '' }),
      
      new Paragraph({
        text: 'INDICATEURS DE PERFORMANCE',
        heading: HeadingLevel.HEADING_2,
      })
    );

    // Table KPIs projet
    const projectKpiTable = new Table({
      columnWidths: [4000, 2000],
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Métrique' })] }),
            new TableCell({ children: [new Paragraph({ text: 'Valeur' })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Tâches totales' })] }),
            new TableCell({ children: [new Paragraph({ text: reportData.stats.totalTasks.toString() })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Tâches terminées' })] }),
            new TableCell({ children: [new Paragraph({ text: reportData.stats.completedTasks.toString() })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Taux de completion des tâches' })] }),
            new TableCell({ children: [new Paragraph({ text: `${Math.round((reportData.stats.completedTasks / (reportData.stats.totalTasks || 1)) * 100)}%` })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Affectations totales' })] }),
            new TableCell({ children: [new Paragraph({ text: reportData.stats.totalAssignments.toString() })] }),
          ],
        }),
      ],
    });

    sections.push(projectKpiTable);

    // Tâches si disponibles
    if (reportData.tasks && reportData.tasks.length > 0) {
      sections.push(
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'TÂCHES DU PROJET',
          heading: HeadingLevel.HEADING_2,
        })
      );

      const tasksTable = new Table({
        columnWidths: [2500, 1500, 1500, 2000],
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: 'Tâche' })] }),
              new TableCell({ children: [new Paragraph({ text: 'Statut' })] }),
              new TableCell({ children: [new Paragraph({ text: 'Phase' })] }),
              new TableCell({ children: [new Paragraph({ text: 'Budget' })] }),
            ],
          }),
          ...reportData.tasks.slice(0, 10).map(task => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: task.title || 'N/A' })] }),
              new TableCell({ children: [new Paragraph({ text: task.status || 'N/A' })] }),
              new TableCell({ children: [new Paragraph({ text: task.projectPhase || 'N/A' })] }),
              new TableCell({ children: [new Paragraph({ text: `${task.budget || 0} j` })] }),
            ],
          })),
        ],
      });

      sections.push(tasksTable);
    }

    // Équipe du projet si disponible
    if (reportData.assignments && reportData.assignments.length > 0) {
      sections.push(
        new Paragraph({ text: '' }),
        new Paragraph({
          text: 'ÉQUIPE DU PROJET',
          heading: HeadingLevel.HEADING_2,
        })
      );

      const teamTable = new Table({
        columnWidths: [3000, 2000, 2000],
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: 'Membre équipe' })] }),
              new TableCell({ children: [new Paragraph({ text: 'Rôle' })] }),
              new TableCell({ children: [new Paragraph({ text: 'Statut' })] }),
            ],
          }),
          ...reportData.assignments.slice(0, 10).map(assignment => {
            // Récupérer le nom complet de l'employé uniquement via fullName
            let memberName = 'Non assigné';
            
            // Priorité 1: l'objet employee (la personne assignée à la tâche)
            if (assignment.employee && typeof assignment.employee === 'object') {
              memberName = getMemberName(assignment.employee);
            }
            // Priorité 2: assignedTo si disponible
            else if (assignment.assignedTo && typeof assignment.assignedTo === 'object') {
              memberName = getMemberName(assignment.assignedTo);
            }
            // Si employee n'est pas populé (ID seulement)
            else if (assignment.employee && typeof assignment.employee === 'string') {
              memberName = `Employé ID: ${assignment.employee.substring(0, 8)}...`;
            }
            
            const status = assignment.status || 'N/A';
            const normalizedStatus = (status === 'canceled' || status === 'cancelled') ? 'not assigned' : status;
            
            return new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: memberName || 'N/A' })] }),
                new TableCell({ children: [new Paragraph({ text: assignment.role || 'N/A' })] }),
                new TableCell({ children: [new Paragraph({ text: normalizedStatus })] }),
              ],
            });
          }),
        ],
      });

      sections.push(teamTable);
    }
  }

  const doc = new Document({
    sections: [{
      children: sections,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
};