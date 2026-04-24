using UnityEngine;
using UnityEngine.InputSystem;

/// <summary>
/// 격자 기반 탑뷰 플레이어 이동 컨트롤러
/// - 타일 1칸 단위로 이동
/// - 이동 중 방향 전환 시 현재 칸 이동 완료 후 전환
/// - Raycast 기반 벽 충돌 감지 (Wall Layer)
/// </summary>
public class PlayerController : MonoBehaviour
{
    [Header("이동 설정")]
    [SerializeField] private float moveSpeed = 4f;      // 일반 이동: 1초에 4칸
    [SerializeField] private float runSpeed = 8f;       // 달리기: 1초에 8칸

    private Vector2 _moveInput;
    private bool _isRunning;
    private bool _isMoving;

    private Vector3 _targetPosition;
    private Vector2 _lastDirection = Vector2.down;      // 마지막 이동 방향

    private GameInputActions _inputActions;

    private void Awake()
    {
        _inputActions = new GameInputActions();
        _targetPosition = transform.position;
    }

    private void OnEnable()
    {
        _inputActions.Player.Enable();
        _inputActions.Player.Move.performed += OnMove;
        _inputActions.Player.Move.canceled += OnMoveCanceled;
        _inputActions.Player.Run.performed += OnRun;
        _inputActions.Player.Run.canceled += OnRunCanceled;
        _inputActions.Player.Select.performed += OnSelect;
    }

    private void OnDisable()
    {
        _inputActions.Player.Move.performed -= OnMove;
        _inputActions.Player.Move.canceled -= OnMoveCanceled;
        _inputActions.Player.Run.performed -= OnRun;
        _inputActions.Player.Run.canceled -= OnRunCanceled;
        _inputActions.Player.Select.performed -= OnSelect;
        _inputActions.Player.Disable();
    }

    private void OnMove(InputAction.CallbackContext ctx)
    {
        _moveInput = ctx.ReadValue<Vector2>();
    }

    private void OnMoveCanceled(InputAction.CallbackContext ctx)
    {
        _moveInput = Vector2.zero;
    }

    private void OnRun(InputAction.CallbackContext ctx)
    {
        _isRunning = true;
    }

    private void OnRunCanceled(InputAction.CallbackContext ctx)
    {
        _isRunning = false;
    }

    private void OnSelect(InputAction.CallbackContext ctx)
    {
        // 이동 중에는 상호작용 불가
        if (_isMoving) return;

        // 바라보는 방향 앞 1칸 체크
        Vector3 interactPos = transform.position + new Vector3(_lastDirection.x, _lastDirection.y, 0);
        InteractableObject obj = GetInteractableAt(interactPos);

        if (obj != null)
            obj.Interact();
    }

    private void Update()
    {
        // 이동 중이면 목표 지점까지 이동 완료 후 다음 입력 처리
        if (_isMoving)
        {
            MoveToTarget();
            return;
        }

        // 입력이 있으면 다음 타일로 이동 시작
        if (_moveInput != Vector2.zero)
        {
            Vector2 dir = GetPrimaryDirection(_moveInput);
            Vector3 next = transform.position + new Vector3(dir.x, dir.y, 0);

            // 벽 충돌 체크
            if (!IsBlocked(next))
            {
                _lastDirection = dir;
                _targetPosition = next;
                _isMoving = true;
            }
        }
    }

    private void MoveToTarget()
    {
        float speed = _isRunning ? runSpeed : moveSpeed;
        transform.position = Vector3.MoveTowards(
            transform.position,
            _targetPosition,
            speed * Time.deltaTime
        );

        if (Vector3.Distance(transform.position, _targetPosition) < 0.001f)
        {
            transform.position = _targetPosition;
            _isMoving = false;
        }
    }

    // 입력값에서 상하좌우 단일 방향 추출
    private Vector2 GetPrimaryDirection(Vector2 input)
    {
        if (Mathf.Abs(input.x) >= Mathf.Abs(input.y))
            return input.x > 0 ? Vector2.right : Vector2.left;
        else
            return input.y > 0 ? Vector2.up : Vector2.down;
    }

    // 바라보는 방향 앞 1칸에 InteractableObject가 있는지 체크
    private InteractableObject GetInteractableAt(Vector3 pos)
    {
        int playerLayer = LayerMask.GetMask("Player");
        int mask = ~playerLayer;

        Collider2D hit = Physics2D.OverlapPoint(new Vector2(pos.x, pos.y), mask);
        if (hit != null)
            return hit.GetComponent<InteractableObject>();
        return null;
    }

    // 이동할 위치가 Wall Layer 오브젝트로 막혀있는지 Raycast로 체크
    private bool IsBlocked(Vector3 targetPos)
    {
        Vector2 direction = new Vector2(targetPos.x - transform.position.x,
                                        targetPos.y - transform.position.y);

        int wallMask = LayerMask.GetMask("Wall");

        RaycastHit2D hit = Physics2D.Raycast(
            new Vector2(transform.position.x, transform.position.y),
            direction,
            1f,
            wallMask
        );

        //Debug.Log($"Raycast 방향: {direction}, 감지: {(hit.collider != null ? hit.collider.gameObject.name : "없음")}");

        return hit.collider != null;
    }
}
