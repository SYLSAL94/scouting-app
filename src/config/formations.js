// src/config/formations.js

export const ALL_PROFILES_KEY = 'all_profiles';

export const formations = {
    '4-3-3': [
        { id: 'GK', displayRole: 'G', positionNeeded: ['GK'], style: { top: '85%', left: '50%' } },
        { id: 'RB', displayRole: 'ARD', positionNeeded: ['RB', 'RB5', 'RWB'], style: { top: '68%', left: '85%' } },
        { id: 'RCB', displayRole: 'DCD', positionNeeded: ['RCB', 'RCB3', 'CB'], style: { top: '70%', left: '65%' } },
        { id: 'LCB', displayRole: 'DCG', positionNeeded: ['LCB', 'LCB3', 'CB'], style: { top: '70%', left: '35%' } },
        { id: 'LB', displayRole: 'ARG', positionNeeded: ['LB', 'LB5', 'LWB'], style: { top: '68%', left: '15%' } },
        { id: 'RCM', displayRole: 'MCD', positionNeeded: ['RCMF', 'RCMF3', 'DMF'], style: { top: '40%', left: '70%' } },
        { id: 'CM', displayRole: 'MC', positionNeeded: ['LCMF', 'LCMF3'], style: { top: '45%', left: '50%' } },
        { id: 'LCM', displayRole: 'MCG', positionNeeded: ['LCMF', 'LCMF3', 'DMF'], style: { top: '40%', left: '30%' } },
        { id: 'RW', displayRole: 'AD', positionNeeded: ['RW', 'RWF', 'RAMF'], style: { top: '10%', left: '80%' } },
        { id: 'ST', displayRole: 'BU', positionNeeded: ['CF'], style: { top: '5%', left: '50%' } },
        { id: 'LW', displayRole: 'AG', positionNeeded: ['LW', 'LWF', 'LAMF'], style: { top: '10%', left: '20%' } },
    ],
    '4-4-2': [
        { id: 'GK', displayRole: 'G', positionNeeded: ['GK'], style: { top: '85%', left: '50%' } },
        { id: 'RB', displayRole: 'ARD', positionNeeded: ['RB', 'RB5', 'RWB'], style: { top: '68%', left: '85%' } },
        { id: 'RCB', displayRole: 'DCD', positionNeeded: ['RCB', 'RCB3', 'CB'], style: { top: '70%', left: '65%' } },
        { id: 'LCB', displayRole: 'DCG', positionNeeded: ['LCB', 'LCB3', 'CB'], style: { top: '70%', left: '35%' } },
        { id: 'LB', displayRole: 'ARG', positionNeeded: ['LB', 'LB5', 'LWB'], style: { top: '68%', left: '15%' } },
        { id: 'RM', displayRole: 'MD', positionNeeded: ['RW', 'RWF'], style: { top: '40%', left: '80%' } },
        { id: 'RCM', displayRole: 'MCD', positionNeeded: ['RCMF', 'RCMF3', 'DMF'], style: { top: '40%', left: '60%' } },
        { id: 'LCM', displayRole: 'MCG', positionNeeded: ['LCMF', 'LCMF3', 'DMF'], style: { top: '40%', left: '40%' } },
        { id: 'LM', displayRole: 'MG', positionNeeded: ['LW', 'LWF'], style: { top: '35%', left: '15%' } },
        { id: 'RST', displayRole: 'BUD', positionNeeded: ['CF'], style: { top: '5%', left: '60%' } },
        { id: 'LST', displayRole: 'BUG', positionNeeded: ['CF'], style: { top: '5%', left: '40%' } },
    ],
    '3-5-2': [
        { id: 'GK', displayRole: 'G', positionNeeded: ['GK'], style: { top: '85%', left: '50%' } },
        { id: 'RCB', displayRole: 'DCD', positionNeeded: ['RCB3'], style: { top: '70%', left: '75%' } },
        { id: 'CB', displayRole: 'DC', positionNeeded: ['CB'], style: { top: '70%', left: '50%' } },
        { id: 'LCB', displayRole: 'DCG', positionNeeded: ['LCB3'], style: { top: '70%', left: '25%' } },
        { id: 'RWB', displayRole: 'MD', positionNeeded: ['RWB', 'RB5'], style: { top: '45%', left: '88%' } },
        { id: 'RCM', displayRole: 'MCD', positionNeeded: ['RCMF', 'RCMF3'], style: { top: '45%', left: '65%' } },
        { id: 'CM', displayRole: 'MOC', positionNeeded: ['AMF'], style: { top: '20%', left: '50%' } },
        { id: 'LCM', displayRole: 'MCG', positionNeeded: ['LCMF', 'LCMF3'], style: { top: '45%', left: '35%' } },
        { id: 'LWB', displayRole: 'MG', positionNeeded: ['LWB', 'LB5'], style: { top: '45%', left: '12%' } },
        { id: 'RST', displayRole: 'BUD', positionNeeded: ['CF'], style: { top: '5%', left: '60%' } },
        { id: 'LST', displayRole: 'BUG', positionNeeded: ['CF'], style: { top: '5%', left: '40%' } },
    ],
    '4-2-3-1': [
        { id: 'GK', displayRole: 'G', positionNeeded: ['GK'], style: { top: '85%', left: '50%' } },
        { id: 'RB', displayRole: 'ARD', positionNeeded: ['RB', 'RB5', 'RWB'], style: { top: '58%', left: '85%' } },
        { id: 'RCB', displayRole: 'DCD', positionNeeded: ['RCB', 'RCB3'], style: { top: '60%', left: '60%' } },
        { id: 'LCB', displayRole: 'DCG', positionNeeded: ['LCB', 'LCB3'], style: { top: '60%', left: '40%' } },
        { id: 'LB', displayRole: 'ARG', positionNeeded: ['LB', 'LB5', 'LWB'], style: { top: '58%', left: '15%' } },
        { id: 'RDMF', displayRole: 'RDMF', positionNeeded: ['RDMF'], style: { top: '40%', left: '60%' } },
        { id: 'LDMF', displayRole: 'LDMF', positionNeeded: ['LDMF'], style: { top: '40%', left: '40%' } },
        { id: 'RAMF', displayRole: 'RAMF', positionNeeded: ['RAMF'], style: { top: '20%', left: '75%' } },
        { id: 'AMF', displayRole: 'AMF', positionNeeded: ['AMF'], style: { top: '20%', left: '50%' } },
        { id: 'LAMF', displayRole: 'LAMF', positionNeeded: ['LAMF'], style: { top: '20%', left: '25%' } },
        { id: 'ST', displayRole: 'BU', positionNeeded: ['CF'], style: { top: '0%', left: '50%' } },
    ]
};
