import { GoabButton, GoabCheckbox, GoabCircularProgress, GoabDropdown, GoabDropdownItem, GoabIcon, GoabInput } from '@abgov/react-components';
import { useEffect, useMemo, useState } from 'react';
import { get } from 'shared/src/lib/api/dataService';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';

import styles from './InboxPage.module.scss';

interface InboxProgram {
    id: string;
    name: string;
    colour: string;
}

interface InboxMessage {
    id: string;
    programId: string;
    subject: string;
    preview: string;
    tag?: string;
    isUnread?: boolean;
    receivedAt: string;
}

interface Inbox {
    programs: InboxProgram[];
    messages: InboxMessage[];
}

const ALL_PROGRAMS = 'all';

const TAG_CLASS: Record<string, string> = {
    'Action required': 'tag-action',
    'New feature': 'tag-new',
    Payment: 'tag-payment',
};

/** Formats a received date as "September 5, 2026" plus a separate time. */
const formatReceived = (value: string): { day: string; time: string } => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return { day: 'Unknown', time: '' };
    }

    return {
        day: date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' }),
        time: date.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase(),
    };
};

export function InboxPage(): React.ReactElement {
    const windowWidth = useWindowWidth();

    const [inbox, setInbox] = useState<Inbox>();
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [programId, setProgramId] = useState(ALL_PROGRAMS);
    const [readIds, setReadIds] = useState<string[]>([]);
    const [openMessageId, setOpenMessageId] = useState<string>();

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await get<{ inbox: Inbox }>('/v1/inbox');
                setInbox(response?.inbox);
            } catch (error) {
                // The messaging service is not always reachable. Show the page
                // with no messages rather than failing outright.
                console.error('Failed to fetch inbox:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const programs = inbox?.programs ?? [];
    const messages = inbox?.messages ?? [];

    const programsById = useMemo(
        () => new Map(programs.map((program) => [program.id, program])),
        [programs]
    );

    /** Opened messages count as read for the rest of the session. */
    const isUnread = (message: InboxMessage) => !!message.isUnread && !readIds.includes(message.id);

    const visibleMessages = useMemo(() => {
        const term = search.trim().toLowerCase();

        const filtered = messages.filter((message) => {
            const program = programsById.get(message.programId);
            const matchesProgram = programId === ALL_PROGRAMS || message.programId === programId;
            const matchesUnread = !unreadOnly || (!!message.isUnread && !readIds.includes(message.id));
            const matchesTerm =
                !term ||
                message.subject.toLowerCase().includes(term) ||
                message.preview.toLowerCase().includes(term) ||
                (program?.name ?? '').toLowerCase().includes(term);

            return matchesProgram && matchesUnread && matchesTerm;
        });

        return filtered.sort((a, b) => {
            const difference = new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime();
            return sortBy === 'oldest' ? difference : -difference;
        });
    }, [messages, programsById, programId, unreadOnly, readIds, search, sortBy]);

    const countFor = (id: string) =>
        id === ALL_PROGRAMS ? messages.length : messages.filter((message) => message.programId === id).length;

    const unreadCount = messages.filter((message) => isUnread(message)).length;

    const openMessage = (message: InboxMessage) => {
        setOpenMessageId(message.id);
        setReadIds((previous) => (previous.includes(message.id) ? previous : [...previous, message.id]));
    };

    if (isLoading) {
        return <GoabCircularProgress variant="inline" size="small" visible={true}></GoabCircularProgress>;
    }

    const openMessageDetails = messages.find((message) => message.id === openMessageId);

    if (openMessageDetails) {
        const program = programsById.get(openMessageDetails.programId);
        const received = formatReceived(openMessageDetails.receivedAt);

        return (
            <div className={styles['container']}>
                {windowWidth <= 623 && <PpSpacer vSpacing="xl" />}
                <GoabButton
                    type="tertiary"
                    leadingIcon="arrow-back"
                    onClick={() => setOpenMessageId(undefined)}
                    testId="back-to-inbox"
                >
                    Back to inbox
                </GoabButton>
                <PpSpacer vSpacing="m" />
                <div className={styles['detail']} data-testid="message-detail">
                    <span className={styles['program']}>
                        <span className={styles['dot']} style={{ backgroundColor: program?.colour }} />
                        {program?.name}
                    </span>
                    <PpSpacer vSpacing="s" />
                    <h1 className={styles['detail-subject']}>{openMessageDetails.subject}</h1>
                    <PpSpacer vSpacing="s" />
                    <p className={styles['detail-meta']}>
                        Received {received.day} at {received.time}
                    </p>
                    <PpSpacer vSpacing="l" />
                    <p>{openMessageDetails.preview}</p>
                    <PpSpacer vSpacing="m" />
                    <p>
                        The full message body is held by the program that sent it. This copy shows the summary the
                        inbox holds.
                    </p>
                </div>
                <PpSpacer vSpacing="2xl" />
            </div>
        );
    }

    return (
        <div className={styles['container']}>
            {windowWidth <= 623 && <PpSpacer vSpacing="xl" />}

            <h1 className={styles['page-heading']}>Inbox</h1>
            <PpSpacer vSpacing="m" />
            <p className={styles['intro']}>
                Secure messages from Government of Alberta programs and services. We will never ask for your password
                or banking details in a message.
            </p>
            <PpSpacer vSpacing="l" />

            <section className={styles['card']}>
                <div className={styles['toolbar']}>
                    <div className={styles['field']}>
                        <label className={styles['field-label']} htmlFor="inbox-search">
                            Search messages
                        </label>
                        <GoabInput
                            id="inbox-search"
                            name="inbox-search"
                            type="text"
                            leadingIcon="search"
                            placeholder="Search by program or subject"
                            value={search}
                            onChange={(detail) => setSearch(detail.value)}
                            testId="inbox-search"
                        />
                    </div>
                    <div className={styles['toolbar-right']}>
                        <GoabCheckbox
                            name="unread-only"
                            checked={unreadOnly}
                            onChange={(detail) => setUnreadOnly(detail.checked)}
                            text={`Unread only (${unreadCount})`}
                            testId="unread-only"
                        />
                        <div className={styles['field']}>
                            <label className={styles['field-label']} htmlFor="inbox-sort">
                                Sort by
                            </label>
                            <GoabDropdown
                                name="inbox-sort"
                                value={sortBy}
                                onChange={(detail) => setSortBy(detail.value ?? 'newest')}
                                testId="inbox-sort"
                            >
                                <GoabDropdownItem value="newest" label="Newest first" />
                                <GoabDropdownItem value="oldest" label="Oldest first" />
                            </GoabDropdown>
                        </div>
                    </div>
                </div>

                <div className={styles['filters']}>
                    <span className={styles['field-label']}>Filter by program</span>
                    <div className={styles['chips']}>
                        <button
                            type="button"
                            className={`${styles['chip']} ${programId === ALL_PROGRAMS ? styles['chip-active'] : ''}`}
                            onClick={() => setProgramId(ALL_PROGRAMS)}
                            data-testid="chip-all"
                        >
                            All messages <span className={styles['chip-count']}>{countFor(ALL_PROGRAMS)}</span>
                        </button>
                        {programs.map((program) => (
                            <button
                                type="button"
                                key={program.id}
                                className={`${styles['chip']} ${programId === program.id ? styles['chip-active'] : ''}`}
                                onClick={() => setProgramId(program.id)}
                                data-testid={`chip-${program.id}`}
                            >
                                <span className={styles['dot']} style={{ backgroundColor: program.colour }} />
                                {program.name} <span className={styles['chip-count']}>{countFor(program.id)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles['table-container']}>
                    <div className={styles['head']}>
                        <span>
                            Program<span className={styles['count']}>{visibleMessages.length}</span>
                        </span>
                        <span>Subject</span>
                        <span>Received</span>
                        <span className={styles['view']}>Details</span>
                    </div>

                    {visibleMessages.length === 0 ? (
                        <p className={styles['empty']} data-testid="inbox-empty">
                            No messages match your search or filters.
                        </p>
                    ) : (
                        visibleMessages.map((message) => {
                            const program = programsById.get(message.programId);
                            const received = formatReceived(message.receivedAt);
                            const unread = isUnread(message);

                            return (
                                <button
                                    type="button"
                                    key={message.id}
                                    className={`${styles['row']} ${unread ? styles['row-unread'] : ''}`}
                                    onClick={() => openMessage(message)}
                                    data-testid={`row-${message.id}`}
                                    aria-label={`Open message: ${message.subject}`}
                                >
                                    <span className={styles['program']}>
                                        <span
                                            className={styles['dot']}
                                            style={{ backgroundColor: program?.colour }}
                                        />
                                        {program?.name}
                                    </span>
                                    <span className={styles['subject']}>
                                        <span className={styles['subject-text']}>{message.subject}</span>
                                        <span className={styles['preview']}>{message.preview}</span>
                                        {message.tag && (
                                            <span
                                                className={`${styles['tag']} ${styles[TAG_CLASS[message.tag] ?? '']}`}
                                            >
                                                {message.tag}
                                            </span>
                                        )}
                                    </span>
                                    <span className={styles['when']}>
                                        {received.day}
                                        <span className={styles['when-time']}>{received.time}</span>
                                    </span>
                                    <span className={styles['view']}>View</span>
                                </button>
                            );
                        })
                    )}

                    <div className={styles['tfoot']}>
                        <span>
                            Showing {visibleMessages.length} of {messages.length} messages. Messages stay in your inbox
                            for 7 years.
                        </span>
                    </div>
                </div>
            </section>

            <PpSpacer vSpacing="l" />

            <section className={styles['notice']}>
                <GoabIcon type="notifications" size="large" />
                <div>
                    <h2 className={styles['notice-heading']}>Choose how programs reach you</h2>
                    <p>
                        Get an email or text when a new message arrives, and pick which programs can notify you.
                        Notification preferences are managed in your Alberta.ca Account, which is not available from
                        here.
                    </p>
                </div>
            </section>

            <PpSpacer vSpacing="2xl" />
        </div>
    );
}

export default InboxPage;
