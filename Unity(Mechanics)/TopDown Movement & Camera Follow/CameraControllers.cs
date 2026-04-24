using UnityEngine;

/// <summary>
/// 탑뷰 카메라 추적 및 맵 경계 클램핑 컨트롤러
/// - 플레이어를 따라 카메라 이동
/// - 맵 경계 밖으로 카메라가 벗어나지 않도록 클램핑
/// - 맵이 카메라 시야보다 작을 경우 맵 중앙 고정
/// </summary>
public class CameraController : MonoBehaviour
{
    [Header("따라갈 대상 / Follow Target")]
    [SerializeField] private Transform target;

    [Header("맵 경계 설정 / Map Boundary")]
    [SerializeField] private float mapMinX;
    [SerializeField] private float mapMaxX;
    [SerializeField] private float mapMinY;
    [SerializeField] private float mapMaxY;

    private Camera _cam;
    private float _camHalfHeight;
    private float _camHalfWidth;

    private void Awake()
    {
        _cam = GetComponent<Camera>();
    }

    private void Start()
    {
        _camHalfHeight = _cam.orthographicSize;
        _camHalfWidth = _camHalfHeight * _cam.aspect;
    }

    private void LateUpdate()
    {
        if (target == null) return;

        float x = target.position.x;
        float y = target.position.y;

        // 맵 너비가 카메라 시야보다 작으면 맵 중앙 고정
        // If map width is smaller than camera view, lock to map center
        if (mapMaxX - mapMinX < _camHalfWidth * 2)
            x = (mapMinX + mapMaxX) / 2f;
        else
            x = Mathf.Clamp(x, mapMinX + _camHalfWidth, mapMaxX - _camHalfWidth);

        // 맵 높이가 카메라 시야보다 작으면 맵 중앙 고정
        // If map height is smaller than camera view, lock to map center
        if (mapMaxY - mapMinY < _camHalfHeight * 2)
            y = (mapMinY + mapMaxY) / 2f;
        else
            y = Mathf.Clamp(y, mapMinY + _camHalfHeight, mapMaxY - _camHalfHeight);

        transform.position = new Vector3(x, y, transform.position.z);
    }
}
