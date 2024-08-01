import React, { useEffect, useState } from 'react';
import { ListGroup, Container } from 'react-bootstrap';
import { requestWithSecureAttackStatus } from '../../../../api';

interface AttackId {
    id: string;
    status: string;
}

interface AttackListProps {
    onSelect: (attackId: string) => void;
}

const AttackList: React.FC<AttackListProps> = ({ onSelect }) => {
    const [attackIds, setAttackIds] = useState<AttackId[]>([]);

    const fetchAttackIds = async () => {
        try {
            const response: AttackId[] = await requestWithSecureAttackStatus() as any;
            if (response.length > 0) {
                const sortedAttackIds = response.sort((a, b) => {
                    if (a.status === b.status) return 0;
                    if (a.status === 'SUCCESS') return -1;
                    if (b.status === 'SUCCESS') return 1;
                    if (a.status === 'FAILURE') return -1;
                    return 1;
                });
                setAttackIds(sortedAttackIds);
            } else {
                setAttackIds([]);
            }
        } catch (error) {
            console.error('Error fetching attack IDs:', error);
            setAttackIds([]);
        }
    };

    useEffect(() => {
        fetchAttackIds();
    }, []);

    return (
        <Container>
            <ListGroup>
                {attackIds.map((attack) => (
                    <ListGroup.Item key={attack.id} action onClick={() => onSelect(attack.id)}>
                        {attack.id} - {attack.status}
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
};

export default AttackList;
