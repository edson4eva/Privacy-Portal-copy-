import {
    GoabButton,
    GoabCheckbox,
    GoabCircularProgress,
    GoabDropdown,
    GoabDropdownItem,
    GoabIcon,
    GoabInput,
} from '@abgov/react-components';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { get } from 'shared/src/lib/api/dataService';
import { PpSpacer } from 'shared/src/lib/pp-spacer/PpSpacer';
import useWindowWidth from 'shared/src/lib/utils/useWindowWidth';

import styles from './InboxPage.module.scss';

interface InboxProgram {
    id: string;
    name: string;
    colour: string;
}

interface MessageSection {
    heading: string;
    paragraphs?: string[];
    bullets?: string[];
}

interface InboxMessage {
    id: string;
    programId: string;
    subject: string;
    preview: string;
    tag?: string;
    isUnread?: boolean;
    receivedAt: string;
    from?: string;
    referenceNumber?: string;
    respondBy?: string;
    greeting?: string;
    paragraphs?: string[];
    callout?: { title: string; text: string };
    sections?: MessageSection[];
    actions?: { label: string; kind: 'primary' | 'secondary' }[];
    attachment?: { name: string; meta: string };
    relatedLinks?: string[];
    help?: { name: string; lines: string[]; contactLabel: string };
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

/** Formats a plain date, for the respond-by row. */
const formatDay = (value: string | undefined): string | undefined => {
    if (!value) {
        return undefined;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? undefined
        : date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
};

/**
 * Days remaining until a deadline. Counted rather than written into the copy,
 * so the callout stays true as the deadline approaches instead of freezing at
 * whatever it read on the day the message was drafted.
 */
const daysUntil = (value: string | undefined): number | undefined => {
    if (!value) {
        return undefined;
    }

    const deadline = new Date(value);
    if (Number.isNaN(deadline.getTime())) {
        return undefined;
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.ceil((deadline.getTime() - Date.now()) / millisecondsPerDay);
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
    const [unreadIds, setUnreadIds] = useState<string[]>([]);
    const [archivedIds, setArchivedIds] = useState<string[]>([]);
    const [actionNotice, setActionNotice] = useState<string>();

    /**
     * Which message is open, and whether the archived list is showing, live in
     * the address rather than in state. Choosing Inbox in the side menu is a
     * navigation to this page with no query, which closes an open message and
     * returns to the inbox - state alone would survive that, because the page
     * is already mounted and never re-renders from scratch. It also makes a
     * message a link somebody can return to.
     */
    const [searchParams, setSearchParams] = useSearchParams();
    const openMessageId = searchParams.get('message') ?? undefined;
    const showArchived = searchParams.get('view') === 'archived';

    const showList = (options?: { archived?: boolean }) => {
        const archived = options?.archived ?? showArchived;
        setSearchParams(archived ? { view: 'archived' } : {});
    };

    const showMessage = (id: string) => {
        const next: Record<string, string> = { message: id };
        if (showArchived) {
            next['view'] = 'archived';
        }
        setSearchParams(next);
    };

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

    const programsById = useMemo(() => new Map(programs.map((program) => [program.id, program])), [programs]);

    /**
     * Opening a message reads it; Mark as unread puts it back. Both are held for
     * the session only, since nothing here writes to the messaging service.
     */
    const isUnread = (message: InboxMessage) =>
        unreadIds.includes(message.id) || (!!message.isUnread && !readIds.includes(message.id));

    const visibleMessages = useMemo(() => {
        const term = search.trim().toLowerCase();

        const filtered = messages.filter((message) => {
            const program = programsById.get(message.programId);
            const matchesArchive = archivedIds.includes(message.id) === showArchived;
            const matchesProgram = programId === ALL_PROGRAMS || message.programId === programId;
            const matchesUnread =
                !unreadOnly || unreadIds.includes(message.id) || (!!message.isUnread && !readIds.includes(message.id));
            const matchesTerm =
                !term ||
                message.subject.toLowerCase().includes(term) ||
                message.preview.toLowerCase().includes(term) ||
                (program?.name ?? '').toLowerCase().includes(term);

            return matchesArchive && matchesProgram && matchesUnread && matchesTerm;
        });

        return filtered.sort((a, b) => {
            const difference = new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime();
            return sortBy === 'oldest' ? difference : -difference;
        });
    }, [messages, programsById, programId, unreadOnly, readIds, unreadIds, archivedIds, showArchived, search, sortBy]);

    const inboxMessages = messages.filter((message) => archivedIds.includes(message.id) === showArchived);

    const countFor = (id: string) =>
        id === ALL_PROGRAMS ? inboxMessages.length : inboxMessages.filter((message) => message.programId === id).length;

    const unreadCount = inboxMessages.filter((message) => isUnread(message)).length;

    const openMessage = (message: InboxMessage) => {
        showMessage(message.id);
        setActionNotice(undefined);
        setUnreadIds((previous) => previous.filter((id) => id !== message.id));
        setReadIds((previous) => (previous.includes(message.id) ? previous : [...previous, message.id]));
    };

    /** Puts a message back to unread and returns to the list, as the design's tool does. */
    const markUnread = (id: string) => {
        setReadIds((previous) => previous.filter((entry) => entry !== id));
        setUnreadIds((previous) => (previous.includes(id) ? previous : [...previous, id]));
        showList();
    };

    const archiveMessage = (id: string) => {
        setArchivedIds((previous) => (previous.includes(id) ? previous : [...previous, id]));
        showList();
    };

    if (isLoading) {
        return <GoabCircularProgress variant="inline" size="small" visible={true}></GoabCircularProgress>;
    }

    const openMessageDetails =
        visibleMessages.find((message) => message.id === openMessageId) ??
        messages.find((message) => message.id === openMessageId);

    if (openMessageDetails) {
        const message = openMessageDetails;
        const program = programsById.get(message.programId);
        const received = formatReceived(message.receivedAt);
        const respondBy = formatDay(message.respondBy);
        const remaining = daysUntil(message.respondBy);

        // Previous and next walk the list the reader came from, not the raw data.
        const position = visibleMessages.findIndex((entry) => entry.id === message.id);
        const previousMessage = position > 0 ? visibleMessages[position - 1] : undefined;
        const nextMessage =
            position >= 0 && position < visibleMessages.length - 1 ? visibleMessages[position + 1] : undefined;

        // Other messages from the same program, newest first.
        const alsoFromProgram = messages
            .filter((entry) => entry.programId === message.programId && entry.id !== message.id)
            .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
            .slice(0, 3);

        return (
            <div className={styles['container']}>
                {windowWidth <= 623 && <PpSpacer vSpacing="xl" />}

                <GoabButton type="tertiary" leadingIcon="arrow-back" onClick={() => showList()} testId="back-to-inbox">
                    Back to inbox
                </GoabButton>
                <PpSpacer vSpacing="m" />

                <div className={styles['detail-layout']}>
                    <section className={styles['card']} data-testid="message-detail">
                        <div className={styles['msg-head']}>
                            <div className={styles['badges']}>
                                <span className={styles['prog-label']}>
                                    <span className={styles['dot']} style={{ backgroundColor: program?.colour }} />
                                    {program?.name}
                                </span>
                                {message.tag && (
                                    <span className={`${styles['tag']} ${styles[TAG_CLASS[message.tag] ?? '']}`}>
                                        {message.tag}
                                    </span>
                                )}
                            </div>
                            <PpSpacer vSpacing="s" />
                            <h1 className={styles['msg-subject']}>{message.subject}</h1>
                        </div>

                        <dl className={styles['meta']}>
                            <div>
                                <dt className={styles['meta-term']}>From</dt>
                                <dd className={styles['meta-value']} data-testid="detail-from">
                                    {message.from ?? program?.name}
                                </dd>
                            </div>
                            <div>
                                <dt className={styles['meta-term']}>Received</dt>
                                <dd className={styles['meta-value']} data-testid="detail-received">
                                    {received.day} at {received.time}
                                </dd>
                            </div>
                            {message.referenceNumber && (
                                <div>
                                    <dt className={styles['meta-term']}>Reference number</dt>
                                    <dd className={styles['meta-value']}>{message.referenceNumber}</dd>
                                </div>
                            )}
                            {respondBy && (
                                <div>
                                    <dt className={styles['meta-term']}>Respond by</dt>
                                    <dd className={styles['meta-value']} data-testid="detail-respond-by">
                                        {respondBy}
                                    </dd>
                                </div>
                            )}
                        </dl>

                        <div className={styles['msg-body']}>
                            {message.greeting && <p>{message.greeting}</p>}
                            {(message.paragraphs ?? [message.preview]).map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}

                            {message.callout && (
                                <div className={styles['callout']} data-testid="detail-callout">
                                    <GoabIcon type="time" size="medium" />
                                    <div>
                                        <strong className={styles['callout-title']}>
                                            {remaining !== undefined && remaining > 0
                                                ? `${remaining} ${remaining === 1 ? 'day' : 'days'} left to respond`
                                                : message.callout.title}
                                        </strong>
                                        <p>{message.callout.text}</p>
                                    </div>
                                </div>
                            )}

                            {message.sections?.map((section) => (
                                <div key={section.heading}>
                                    <h2 className={styles['body-heading']}>{section.heading}</h2>
                                    <PpSpacer vSpacing="s" />
                                    {section.bullets && (
                                        <ul className={styles['bullets']}>
                                            {section.bullets.map((bullet) => (
                                                <li key={bullet}>{bullet}</li>
                                            ))}
                                        </ul>
                                    )}
                                    {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                                </div>
                            ))}

                            {!message.sections && !message.paragraphs && (
                                <p className={styles['panel-note']}>
                                    The full message is held by the program that sent it. This copy shows the summary
                                    the inbox holds.
                                </p>
                            )}
                        </div>

                        {message.actions && (
                            <div className={styles['msg-actions']}>
                                {message.actions.map((action) => (
                                    <GoabButton
                                        key={action.label}
                                        type={action.kind === 'primary' ? 'primary' : 'secondary'}
                                        onClick={() => setActionNotice(action.label)}
                                        testId={`action-${action.kind}`}
                                    >
                                        {action.label}
                                    </GoabButton>
                                ))}
                            </div>
                        )}

                        {actionNotice && (
                            <div className={styles['msg-actions']} data-testid="action-notice">
                                <p className={styles['panel-note']}>
                                    {actionNotice} is completed in the program's own service, which is not part of this
                                    application.
                                </p>
                            </div>
                        )}

                        {message.attachment && (
                            <div className={styles['attach']} data-testid="detail-attachment">
                                <GoabIcon type="document-text" size="large" />
                                <span>
                                    {message.attachment.name}
                                    <span className={styles['attach-meta']}>{message.attachment.meta}</span>
                                </span>
                            </div>
                        )}

                        <div className={styles['msg-foot']}>
                            <span className={styles['msg-tools']}>
                                <button
                                    type="button"
                                    className={styles['tool']}
                                    onClick={() => markUnread(message.id)}
                                    data-testid="mark-unread"
                                >
                                    Mark as unread
                                </button>
                                <button
                                    type="button"
                                    className={styles['tool']}
                                    onClick={() => archiveMessage(message.id)}
                                    data-testid="archive"
                                >
                                    Archive
                                </button>
                            </span>
                            <span className={styles['msg-tools']}>
                                <button
                                    type="button"
                                    className={styles['tool']}
                                    disabled={!previousMessage}
                                    onClick={() => previousMessage && openMessage(previousMessage)}
                                    data-testid="previous-message"
                                >
                                    Previous message
                                </button>
                                <button
                                    type="button"
                                    className={styles['tool']}
                                    disabled={!nextMessage}
                                    onClick={() => nextMessage && openMessage(nextMessage)}
                                    data-testid="next-message"
                                >
                                    Next message
                                </button>
                            </span>
                        </div>
                    </section>

                    <aside className={styles['aside']}>
                        <div className={styles['secure']}>
                            <GoabIcon type="shield-checkmark" size="medium" />
                            <p>
                                This message was sent through your Alberta.ca Account. Government of Alberta programs
                                will never ask for your password, PIN or banking details in a message.
                            </p>
                        </div>

                        {alsoFromProgram.length > 0 && (
                            <div className={styles['panel']} data-testid="panel-program-history">
                                <h2 className={styles['panel-heading']}>More from this program</h2>
                                {alsoFromProgram.map((entry) => (
                                    <button
                                        type="button"
                                        key={entry.id}
                                        className={`${styles['tool']} ${styles['thread-item']}`}
                                        onClick={() => openMessage(entry)}
                                        data-testid={`history-${entry.id}`}
                                    >
                                        {entry.subject}
                                        <span className={styles['thread-date']}>
                                            {formatReceived(entry.receivedAt).day}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {message.relatedLinks && (
                            <div className={styles['panel']}>
                                <h2 className={styles['panel-heading']}>Related information</h2>
                                <ul>
                                    {message.relatedLinks.map((link) => (
                                        <li key={link}>{link}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {message.help && (
                            <div className={styles['panel']}>
                                <h2 className={styles['panel-heading']}>Need help?</h2>
                                <p className={styles['panel-note']}>
                                    {message.help.name}
                                    {message.help.lines.map((line) => (
                                        <span key={line} style={{ display: 'block' }}>
                                            {line}
                                        </span>
                                    ))}
                                </p>
                                <p className={styles['panel-note']}>{message.help.contactLabel}</p>
                            </div>
                        )}
                    </aside>
                </div>

                <PpSpacer vSpacing="2xl" />
            </div>
        );
    }

    return (
        <div className={styles['container']}>
            {windowWidth <= 623 && <PpSpacer vSpacing="xl" />}

            <h1 className={styles['page-heading']}>{showArchived ? 'Archived messages' : 'Inbox'}</h1>
            <PpSpacer vSpacing="m" />
            <p className={styles['intro']}>
                Secure messages from Government of Alberta programs and services. We will never ask for your password or
                banking details in a message.
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
                            text={`Unread (${unreadCount})`}
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
                                        <span className={styles['dot']} style={{ backgroundColor: program?.colour }} />
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
                            Showing {visibleMessages.length} of {inboxMessages.length}{' '}
                            {showArchived ? 'archived messages' : 'messages'}. Messages stay in your inbox for 7 years.
                        </span>
                        <button
                            type="button"
                            className={styles['tool']}
                            onClick={() => {
                                showList({ archived: !showArchived });
                                setProgramId(ALL_PROGRAMS);
                            }}
                            data-testid="toggle-archived"
                        >
                            {showArchived ? 'Back to inbox' : `Go to archived messages (${archivedIds.length})`}
                        </button>
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
