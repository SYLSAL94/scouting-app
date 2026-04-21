import { useState, useEffect, useMemo } from 'react';

export const useMetricSelection = () => {
    const [selectedMetrics, setSelectedMetrics] = useState([]);
    const [selectedTemplateLabels, setSelectedTemplateLabels] = useState(new Set());
    const [metricDisplayMode, setMetricDisplayMode] = useState('percentile'); 
    const [customTemplates, setCustomTemplates] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('wyscout_custom_templates');
        if (saved) {
            try { setCustomTemplates(JSON.parse(saved)); } catch (e) {}
        }
    }, []);

    const handleMetricToggle = (metricId) => {
        setSelectedMetrics(prev => {
            if (prev.includes(metricId)) return prev.filter(m => m !== metricId);
            return [...prev, metricId];
        });
        setSelectedTemplateLabels(new Set());
    };

    const handleTemplateToggle = (templateKey, metrics) => {
        const nextLabels = new Set(selectedTemplateLabels);
        let nextMetrics = [...selectedMetrics];

        if (nextLabels.has(templateKey)) {
            nextLabels.delete(templateKey);
            nextMetrics = nextMetrics.filter(m => !metrics.includes(m));
        } else {
            nextLabels.add(templateKey);
            metrics.forEach(m => {
                if (!nextMetrics.includes(m)) nextMetrics.push(m);
            });
        }
        setSelectedTemplateLabels(nextLabels);
        setSelectedMetrics(nextMetrics);
    };

    const handleResetMetrics = () => {
        setSelectedMetrics([]);
        setSelectedTemplateLabels(new Set());
    };

    const saveCustomTemplate = (name) => {
        const newTemplate = { id: Date.now().toString(), name, metrics: selectedMetrics };
        const next = [...customTemplates, newTemplate];
        setCustomTemplates(next);
        localStorage.setItem('wyscout_custom_templates', JSON.stringify(next));
    };

    const deleteCustomTemplate = (id) => {
        const next = customTemplates.filter(t => t.id !== id);
        setCustomTemplates(next);
        localStorage.setItem('wyscout_custom_templates', JSON.stringify(next));
    };

    const applyCustomTemplate = (template) => {
        setSelectedMetrics(template.metrics || []);
        setSelectedTemplateLabels(new Set());
    };

    const activeMetrics = useMemo(() => {
        return selectedMetrics.map(m => m.replace(/_norm$|_pct$/, ''));
    }, [selectedMetrics]);

    return {
        selectedMetrics,
        setSelectedMetrics,
        selectedTemplateLabels,
        setSelectedTemplateLabels,
        metricDisplayMode,
        setMetricDisplayMode,
        customTemplates,
        handleMetricToggle,
        handleTemplateToggle,
        handleResetMetrics,
        saveCustomTemplate,
        deleteCustomTemplate,
        applyCustomTemplate,
        activeMetrics
    };
};
