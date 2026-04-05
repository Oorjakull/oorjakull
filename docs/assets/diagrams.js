mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  theme: 'base',
  themeVariables: {
    primaryColor:       '#1e1e21',
    primaryTextColor:   '#F5F0E8',
    primaryBorderColor: '#8BAF8D',
    lineColor:          '#8BAF8D',
    secondaryColor:     '#161618',
    tertiaryColor:      '#0f0f11',
    background:         '#0f0f11',
    mainBkg:            '#1e1e21',
    nodeBorder:         '#8BAF8D',
    clusterBkg:         '#161618',
    titleColor:         '#D4A96A',
    edgeLabelBackground:'#1e1e21',
    fontFamily:         'DM Sans, sans-serif',
    fontSize:           '13px',
  },
  flowchart: { curve: 'basis', padding: 20 },
  sequence:  { mirrorActors: false, messageAlign: 'center' },
  er:        { diagramPadding: 20 },
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => mermaid.run({ querySelector: '.mermaid' }));
} else {
  mermaid.run({ querySelector: '.mermaid' });
}
