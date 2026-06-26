// Contract Studio — built-in templates
// All templates are import-free, self-contained, and Arc-compatible.
// Browser solc cannot resolve npm imports, so OpenZeppelin is inlined minimally.
// No PREVRANDAO / block.difficulty usage anywhere.

export interface ContractTemplate {
  id:       string
  name:     string
  category: string
  description: string
  source:   string
}

export const TEMPLATES: ContractTemplate[] = [
  {
    id:       'erc20-basic',
    name:     'ERC20 Token',
    category: 'Tokens',
    description: 'Standard ERC20 with mint and burn. Import-free, Arc-compatible.',
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ArcToken
 * @notice Import-free, Arc-compatible ERC20 token.
 *
 * Arc notes:
 * - Gas is paid in USDC (not ETH).
 * - Transfers to address(0) revert.
 * - No PREVRANDAO/block.difficulty used (returns 0 on Arc).
 */
contract ArcToken {
    string public name;
    string public symbol;
    uint8  public immutable decimals;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    error NotOwner();
    error ZeroAddress();
    error InsufficientBalance();
    error InsufficientAllowance();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply
    ) {
        name     = name_;
        symbol   = symbol_;
        decimals = decimals_;
        owner    = msg.sender;
        _mint(msg.sender, initialSupply * 10 ** decimals_);
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed < value) revert InsufficientAllowance();
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - value;
        }
        _transfer(from, to, value);
        return true;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        if (balanceOf[msg.sender] < amount) revert InsufficientBalance();
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }

    function _transfer(address from, address to, uint256 value) internal {
        if (to == address(0)) revert ZeroAddress();
        if (balanceOf[from] < value) revert InsufficientBalance();
        balanceOf[from] -= value;
        balanceOf[to]   += value;
        emit Transfer(from, to, value);
    }

    function _mint(address to, uint256 amount) internal {
        if (to == address(0)) revert ZeroAddress();
        totalSupply    += amount;
        balanceOf[to]  += amount;
        emit Transfer(address(0), to, amount);
    }
}
`,
  },

  {
    id:       'erc721-basic',
    name:     'ERC721 NFT',
    category: 'NFTs',
    description: 'ERC721 collection with per-token URI storage. Import-free, Arc-compatible.',
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ArcNFT
 * @notice Import-free, Arc-compatible ERC721 collection.
 *
 * Arc notes:
 * - No PREVRANDAO randomness; mint IDs are sequential.
 * - Transfers to address(0) revert.
 */
contract ArcNFT {
    string public name;
    string public symbol;
    address public owner;

    uint256 private _nextTokenId;
    uint256 public maxSupply;

    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public getApproved;
    mapping(address => mapping(address => bool)) public isApprovedForAll;
    mapping(uint256 => string)  private _tokenURIs;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    error NotOwner();
    error ZeroAddress();
    error MaxSupplyReached();
    error NotAuthorized();
    error TokenNotFound();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(string memory name_, string memory symbol_, uint256 maxSupply_) {
        name      = name_;
        symbol    = symbol_;
        maxSupply = maxSupply_;
        owner     = msg.sender;
    }

    function mint(address to, string calldata uri) external onlyOwner returns (uint256 tokenId) {
        if (to == address(0)) revert ZeroAddress();
        if (_nextTokenId >= maxSupply) revert MaxSupplyReached();

        tokenId = _nextTokenId++;
        ownerOf[tokenId]   = to;
        balanceOf[to]     += 1;
        _tokenURIs[tokenId] = uri;
        emit Transfer(address(0), to, tokenId);
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        if (ownerOf[tokenId] == address(0)) revert TokenNotFound();
        return _tokenURIs[tokenId];
    }

    function approve(address to, uint256 tokenId) external {
        address holder = ownerOf[tokenId];
        if (msg.sender != holder && !isApprovedForAll[holder][msg.sender]) revert NotAuthorized();
        getApproved[tokenId] = to;
        emit Approval(holder, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) external {
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        if (to == address(0)) revert ZeroAddress();
        if (ownerOf[tokenId] != from) revert NotAuthorized();
        if (
            msg.sender != from &&
            getApproved[tokenId] != msg.sender &&
            !isApprovedForAll[from][msg.sender]
        ) revert NotAuthorized();

        delete getApproved[tokenId];
        balanceOf[from] -= 1;
        balanceOf[to]   += 1;
        ownerOf[tokenId] = to;
        emit Transfer(from, to, tokenId);
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }
}
`,
  },

  {
    id:       'erc1155-basic',
    name:     'ERC1155 Multi-token',
    category: 'NFTs',
    description: 'ERC1155 for batch operations and multiple token types. Import-free, Arc-compatible.',
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ArcMultiToken
 * @notice Import-free, Arc-compatible ERC1155 multi-token.
 *
 * Arc notes:
 * - No PREVRANDAO usage.
 * - Batch operations are gas-efficient on Arc (USDC gas).
 */
contract ArcMultiToken {
    address public owner;
    string  public uri;

    mapping(uint256 => mapping(address => uint256)) public balanceOf;
    mapping(address => mapping(address => bool)) public isApprovedForAll;
    mapping(uint256 => uint256) public totalSupply;

    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    error NotOwner();
    error NotAuthorized();
    error LengthMismatch();
    error InsufficientBalance();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(string memory uri_) {
        uri   = uri_;
        owner = msg.sender;
    }

    function mint(address to, uint256 id, uint256 amount) external onlyOwner {
        balanceOf[id][to] += amount;
        totalSupply[id]   += amount;
        emit TransferSingle(msg.sender, address(0), to, id, amount);
    }

    function mintBatch(address to, uint256[] calldata ids, uint256[] calldata amounts) external onlyOwner {
        if (ids.length != amounts.length) revert LengthMismatch();
        for (uint256 i = 0; i < ids.length; i++) {
            balanceOf[ids[i]][to] += amounts[i];
            totalSupply[ids[i]]   += amounts[i];
        }
        emit TransferBatch(msg.sender, address(0), to, ids, amounts);
    }

    function setApprovalForAll(address operator, bool approved) external {
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function safeTransferFrom(address from, address to, uint256 id, uint256 amount) external {
        if (msg.sender != from && !isApprovedForAll[from][msg.sender]) revert NotAuthorized();
        if (balanceOf[id][from] < amount) revert InsufficientBalance();
        balanceOf[id][from] -= amount;
        balanceOf[id][to]   += amount;
        emit TransferSingle(msg.sender, from, to, id, amount);
    }

    function setURI(string calldata newURI) external onlyOwner {
        uri = newURI;
    }
}
`,
  },

  {
    id:       'arc-agent',
    name:     'AI Agent Registry (ERC-8004)',
    category: 'Arc Native',
    description: 'Register an AI agent with onchain identity and reputation. Import-free.',
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ArcAgentIdentity
 * @notice ERC-8004 style AI agent identity registry.
 *
 * Arc notes:
 * - Import-free and self-contained.
 * - No PREVRANDAO; agent IDs derive from sender + name + a nonce.
 * - Gas paid in USDC (~$0.01 per registration).
 */
contract ArcAgentIdentity {
    struct Agent {
        address owner;
        string  name;
        string  description;
        string  metadataURI;
        uint256 reputationScore;
        uint256 registeredAt;
        bool    verified;
    }

    mapping(bytes32 => Agent) public agents;
    mapping(address => bytes32[]) private _ownerAgents;
    mapping(address => uint256) private _nonce;

    event AgentRegistered(bytes32 indexed agentId, address indexed owner, string name);
    event ReputationUpdated(bytes32 indexed agentId, uint256 newScore);

    error AgentAlreadyExists();
    error AgentNotFound();
    error NotAgentOwner();

    function registerAgent(
        string calldata name,
        string calldata description,
        string calldata metadataURI
    ) external returns (bytes32 agentId) {
        agentId = keccak256(abi.encodePacked(msg.sender, name, _nonce[msg.sender]++));
        if (agents[agentId].registeredAt != 0) revert AgentAlreadyExists();

        agents[agentId] = Agent({
            owner:           msg.sender,
            name:            name,
            description:     description,
            metadataURI:     metadataURI,
            reputationScore: 0,
            registeredAt:    block.timestamp,
            verified:        false
        });

        _ownerAgents[msg.sender].push(agentId);
        emit AgentRegistered(agentId, msg.sender, name);
    }

    function updateReputation(bytes32 agentId, uint256 newScore) external {
        Agent storage a = agents[agentId];
        if (a.registeredAt == 0) revert AgentNotFound();
        if (a.owner != msg.sender) revert NotAgentOwner();
        a.reputationScore = newScore;
        emit ReputationUpdated(agentId, newScore);
    }

    function getAgent(bytes32 agentId) external view returns (Agent memory) {
        if (agents[agentId].registeredAt == 0) revert AgentNotFound();
        return agents[agentId];
    }

    function getOwnerAgents(address owner_) external view returns (bytes32[] memory) {
        return _ownerAgents[owner_];
    }
}
`,
  },

  {
    id:       'arc-job',
    name:     'AI Job Contract (ERC-8183)',
    category: 'Arc Native',
    description: 'Job lifecycle with USDC escrow and settlement. Import-free.',
    source: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ArcJob
 * @notice ERC-8183 style job contract with native USDC escrow.
 *
 * Lifecycle: Open -> Active -> Submitted -> Completed | Cancelled
 *
 * Arc notes:
 * - Escrow held as native USDC (msg.value).
 * - Uses call() for payouts instead of transfer() for Arc compatibility.
 * - No PREVRANDAO usage.
 */
contract ArcJob {
    enum Status { Open, Active, Submitted, Completed, Cancelled }

    struct Job {
        address client;
        address worker;
        string  title;
        string  description;
        uint256 escrowAmount;
        uint256 deadline;
        Status  status;
    }

    mapping(uint256 => Job) public jobs;
    uint256 public nextJobId;

    event JobCreated(uint256 indexed jobId, address indexed client, uint256 escrow);
    event JobAccepted(uint256 indexed jobId, address indexed worker);
    event JobSubmitted(uint256 indexed jobId);
    event JobCompleted(uint256 indexed jobId, address indexed worker, uint256 payment);
    event JobCancelled(uint256 indexed jobId);

    error InsufficientEscrow();
    error JobNotFound();
    error Unauthorized();
    error InvalidStatus();
    error DeadlinePassed();
    error PayoutFailed();

    function createJob(
        string calldata title,
        string calldata description,
        uint256 deadline
    ) external payable returns (uint256 jobId) {
        if (msg.value == 0) revert InsufficientEscrow();

        jobId = nextJobId++;
        jobs[jobId] = Job({
            client:       msg.sender,
            worker:       address(0),
            title:        title,
            description:  description,
            escrowAmount: msg.value,
            deadline:     deadline,
            status:       Status.Open
        });

        emit JobCreated(jobId, msg.sender, msg.value);
    }

    function acceptJob(uint256 jobId) external {
        Job storage job = jobs[jobId];
        if (job.client == address(0))       revert JobNotFound();
        if (job.status != Status.Open)      revert InvalidStatus();
        if (block.timestamp > job.deadline) revert DeadlinePassed();

        job.worker = msg.sender;
        job.status = Status.Active;
        emit JobAccepted(jobId, msg.sender);
    }

    function submitWork(uint256 jobId) external {
        Job storage job = jobs[jobId];
        if (msg.sender != job.worker)    revert Unauthorized();
        if (job.status != Status.Active) revert InvalidStatus();
        job.status = Status.Submitted;
        emit JobSubmitted(jobId);
    }

    function completeJob(uint256 jobId) external {
        Job storage job = jobs[jobId];
        if (msg.sender != job.client)        revert Unauthorized();
        if (job.status != Status.Submitted)  revert InvalidStatus();

        uint256 payment  = job.escrowAmount;
        job.status       = Status.Completed;
        job.escrowAmount = 0;

        (bool ok, ) = payable(job.worker).call{value: payment}("");
        if (!ok) revert PayoutFailed();
        emit JobCompleted(jobId, job.worker, payment);
    }

    function cancelJob(uint256 jobId) external {
        Job storage job = jobs[jobId];
        if (msg.sender != job.client)   revert Unauthorized();
        if (job.status != Status.Open)  revert InvalidStatus();

        uint256 refund   = job.escrowAmount;
        job.status       = Status.Cancelled;
        job.escrowAmount = 0;

        (bool ok, ) = payable(job.client).call{value: refund}("");
        if (!ok) revert PayoutFailed();
        emit JobCancelled(jobId);
    }
}
`,
  },
]

export const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]))

export const DEFAULT_SOURCE = TEMPLATES[0].source